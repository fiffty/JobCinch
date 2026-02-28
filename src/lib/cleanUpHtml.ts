import * as cheerio from "cheerio";

/**
 * Cleans up HTML by removing non-content elements, hidden elements, and common layout elements
 * @param {string} htmlString - The input HTML string to clean
 * @returns {string} - Cleaned HTML string
 */
export function cleanUpHtml(htmlString: string): string {
  const $ = cheerio.load(htmlString);

  // Remove common non-content elements
  $("head, script, style, noscript, iframe, meta, link").remove();

  // Remove form elements
  $("form, input, select, textarea, option").remove();

  // Remove common navigation and peripheral elements
  $(
    "nav, header, footer, aside, address, .nav, .navigation, .menu, .sidebar, " +
      ".header, .footer, .breadcrumbs, .pagination, .author-info, .copyright, " +
      ".disclaimer, .legal, .cookie-consent, .newsletter, .subscribe, " +
      ".search-box, .search-form, .social, .share, .comments, .related, " +
      ".promo, .widget, .advertisement, .ad-container",
  ).remove();

  // Remove elements by ID
  $(
    "#sidebar, #footer, #header, #navigation, #ads, #advertisement, " +
      "#promo, #widget, #social-links, #related-posts, #comments-section",
  ).remove();

  // Remove elements by role attribute
  $("[role='complementary'], [role='navigation']").remove();

  // Remove metadata attributes
  $(
    "[itemprop='publisher'], [itemprop='author'], [itemprop='datePublished']",
  ).remove();

  // Remove multimedia elements (but keep figures that might be important content)
  $("img, video, audio, picture, svg, canvas, object, embed").remove();

  // Remove elements with text content patterns indicating non-content
  $("*").each((_: number, element: cheerio.Element) => {
    const $el = $(element);
    const text = $el.text().trim();
    const tagName = $el.prop("tagName")?.toLowerCase();

    // Skip if text is empty
    if (!text) return;

    // Common non-content text patterns
    const nonContentPatterns = [
      /advertisement/i,
      /^ad$/i,
      /sponsored/i,
      /promotion/i,
      /related posts/i,
      /you may also like/i,
      /recommended/i,
      /share this/i,
      /follow us/i,
      /copyright/i,
      /privacy policy/i,
      /terms of service/i,
      /contact us/i,
      /about us/i,
      /cookie policy/i,
      /newsletter/i,
      /subscribe/i,
      /search/i,
      /site map/i,
      /back to top/i,
    ];

    // Check if the element is likely to be a UI element rather than content
    const isLikelyUIElement =
      ["div", "span", "button", "a", "li", "ul"].includes(tagName) &&
      ($el.attr("class") || "").match(
        /(nav|menu|button|link|icon|widget|sidebar|footer|header)/i,
      );

    // Calculate a score based on the ratio of matched text to total text
    let matchedChars = 0;
    let matchedText = "";

    // Find all matches from all patterns
    for (const pattern of nonContentPatterns) {
      const matches = text.match(new RegExp(pattern.source, "gi"));
      if (matches) {
        for (const match of matches) {
          // Avoid double-counting overlapping matches
          if (!matchedText.includes(match)) {
            matchedText += match;
            matchedChars += match.length;
          }
        }
      }
    }

    // Calculate the ratio of matched characters to total characters
    const totalChars = text.length;
    const matchRatio = matchedChars / totalChars;

    // Different thresholds based on element type and content length
    let threshold = 0.5; // Default threshold - 50% of text matches patterns

    // Adjust threshold based on element type and context
    if (
      [
        "p",
        "article",
        "section",
        "main",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ].includes(tagName)
    ) {
      // Higher threshold for main content elements
      threshold = 0.8; // 80% must match to be removed
    } else if (isLikelyUIElement) {
      // Lower threshold for UI elements
      threshold = 0.3; // 30% must match to be removed
    } else if (text.length > 100) {
      // Higher threshold for longer text
      threshold = 0.7; // 70% must match to be removed
    }

    // Remove element if the match ratio exceeds the threshold
    if (matchRatio >= threshold) {
      $el.remove();
    }
  });

  // Remove elements with CSS hiding patterns
  $("*").each((_: number, element: cheerio.Element) => {
    const $el = $(element);
    const style = $el.attr("style") || "";
    const className = $el.attr("class") || "";

    // Check for common CSS hiding patterns
    if (
      /display\s*:\s*none/i.test(style) ||
      /visibility\s*:\s*hidden/i.test(style) ||
      /opacity\s*:\s*0/i.test(style) ||
      (/position\s*:\s*(fixed|absolute)/i.test(style) &&
        /z-index\s*:\s*\d{3,}/i.test(style)) ||
      (/width\s*:\s*1px/i.test(style) && /height\s*:\s*1px/i.test(style)) ||
      /left\s*:\s*-\d{4,}px/i.test(style) ||
      className.includes("d-none") ||
      className.includes("hidden") ||
      className.includes("invisible") ||
      className.includes("offscreen")
    ) {
      $el.remove();
    }
  });

  // Remove elements with low content scores, but be careful with nested content
  $("*[data-content-score]").each((_: number, element: cheerio.Element) => {
    const $el = $(element);
    const score = parseInt($el.attr("data-content-score") || "0");

    // If score is very negative and doesn't contain important content elements
    if (
      score <= -5 &&
      !$el.find("article, p, h1, h2, h3, h4, h5, h6, main, blockquote").length
    ) {
      $el.remove();
    }
  });

  // Clean up data attributes we added
  $("[data-content-score]").removeAttr("data-content-score");

  // Remove empty elements (except for specific tags that can be meaningfully empty)
  function removeEmptyElements($: ReturnType<typeof cheerio.load>): boolean {
    let removedAny = false;
    $("*").each((_: number, element: cheerio.Element) => {
      const $el = $(element);
      const tagName = $el.prop("tagName")?.toLowerCase();

      // Skip elements that can be meaningfully empty
      if (["br", "hr"].includes(tagName)) {
        return;
      }

      if (!$el.text().trim() && !$el.children().length) {
        $el.remove();
        removedAny = true;
      }
    });
    return removedAny;
  }

  // Remove empty elements repeatedly until no more can be removed or max iterations reached
  const MAX_ITERATIONS = 5;
  let iteration = 0;
  while (iteration < MAX_ITERATIONS) {
    const removedAny = removeEmptyElements($);
    if (!removedAny) break;
    iteration++;
  }

  // Get the HTML content
  let html = $.html();

  // Remove excessive whitespace and newlines
  html = html.replace(/>\s+</g, "><"); // Remove whitespace between tags
  html = html.replace(/\s{2,}/g, " "); // Replace multiple spaces with a single space
  html = html.trim(); // Trim leading and trailing whitespace

  return html;
}
