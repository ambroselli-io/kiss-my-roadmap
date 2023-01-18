import sharp from "sharp";
import fs from "fs";
import { capture } from "./sentry.server";

const fourLinesReciprocalHeights = [255, 297, 339, 381];
const threeLinesReciprocalHeights = [273, 315, 357];
const twoLinesReciprocalHeights = fourLinesReciprocalHeights.slice(1, 3);
const fourLinesHeights = [48, 90, 132, 174];
const threeLinesHeights = [78, 120, 162];
const twoLinesHeights = fourLinesHeights.slice(1, 3);
const oneLineHeight = threeLinesHeights.slice(1, 2);
const oneLineReciprocalHeight = threeLinesReciprocalHeights.slice(1, 2);

const heights = {
  1: oneLineHeight,
  2: twoLinesHeights,
  3: threeLinesHeights,
  4: fourLinesHeights,
};

const reciprocalHeights = {
  1: oneLineReciprocalHeight,
  2: twoLinesReciprocalHeights,
  3: threeLinesReciprocalHeights,
  4: fourLinesReciprocalHeights,
};

const maxNumberOfLettersPerLine = 40;
const idealNumberOfLettersPerLine = 34;

const formatLine = (height, content) =>
  `<tspan x="332" y="${height}" text-anchor="middle">${content}</tspan>`;

const formatSentenceInLines = (sentence, numberOfLetterPerLines) =>
  sentence
    .replace(" :", ":")
    .split(" ")
    .map((w) => (w.includes(":") ? `${w.replace(":", "")} :` : w))
    .reduce(
      (lines, word, index) => {
        const lastLine = lines[lines.length - 1];
        if (lastLine.length + word.length < numberOfLetterPerLines) {
          return [...lines.slice(0, -1), lastLine + (index === 0 ? "" : " ") + word];
        } else {
          return [...lines, word];
        }
      },
      [""]
    );

const formatTitleInLines = (title) => {
  try {
    const numberOfLetters = title.length;

    if (numberOfLetters / idealNumberOfLettersPerLine <= 2) {
      return formatSentenceInLines(title, idealNumberOfLettersPerLine);
    }
    if (numberOfLetters / idealNumberOfLettersPerLine > 3) {
      if (numberOfLetters / maxNumberOfLettersPerLine < 3) {
        return formatSentenceInLines(title, maxNumberOfLettersPerLine);
      }
    }
    if (numberOfLetters / idealNumberOfLettersPerLine > 4) {
      return formatSentenceInLines(title, maxNumberOfLettersPerLine);
    }
    return formatSentenceInLines(title, idealNumberOfLettersPerLine);
  } catch (e) {
    capture(e);
    return "";
  }
};

const formatLinesInSvg = (lines, isReciprocal) => {
  try {
    const numberOfLines = lines.length;
    const lineHeights = isReciprocal
      ? reciprocalHeights[numberOfLines]
      : heights[numberOfLines];
    return lines.map((line, index) => formatLine(lineHeights[index], line)).join("");
  } catch (e) {
    capture(e);
    return "";
  }
};

const formatTitleInSvg = (title, isReciprocal) => {
  const lines = formatTitleInLines(title);
  return formatLinesInSvg(lines, isReciprocal);
};

export const buildPNGOGImageFromSVG = async (topic, isReciprocal) => {
  try {
    if (!topic) return;
    const { title, reciprocal } = topic;
    /*
     </mask>
                    <rect stroke="#7A0BE0" stroke-width="13" x="6.5" y="6.5" width="653" height="410" rx="28"></rect>
                    <rect id="Rectangle" fill="#7A0BE0" mask="url(#mask-4)" x="0" y="211" width="666" height="212"></rect>
                    <text id="abcdef-abcdef-abcdef" mask="url(#mask-4)" transform="translate(332.500000, 318.000000) rotate(180.000000) translate(-332.500000, -318.000000) " font-family="Helvetica-Bold, Helvetica" font-size="35" font-weight="bold" fill="#FFFFFF">
                        {RECIPROCAL}
                    </text>
                    <rect id="Rectangle" fill="#FFFFFF" mask="url(#mask-4)" x="0" y="0" width="666" height="212"></rect>
                    <text id="abcdef-abcdef-abcdef" mask="url(#mask-4)" font-family="Helvetica-Bold, Helvetica" font-size="35" font-weight="bold" fill="#9300F2">
                        {ORIGINAL}
                    </text>
                    <rect id="Mask" stroke="#7A0BE0" stroke-width="13" mask="url(#mask-4)" x="6.5" y="6.5" width="653" height="410" rx="28"></rect>
                    <g id="YingYangWhite" mask="url(#mask-4)">

                    top-fill
    */
    const svgOGImage = fs.readFileSync("./public/assets/pictures/og-image.svg", "utf8");
    const topTitle = reciprocal && isReciprocal ? reciprocal : title;
    const bottomTitle = reciprocal && isReciprocal ? title : reciprocal;
    const formattedTopTitle = formatTitleInSvg(topTitle);
    let formattedBottomTitle = reciprocal ? formatTitleInSvg(bottomTitle, true) : "";
    const svgPopulated = svgOGImage
      .replace("{RECIPROCAL}", formattedBottomTitle)
      .replace("{ORIGINAL}", formattedTopTitle)
      .replace("{FILL_1}", isReciprocal ? "#ffffff" : "#7A0BE0")
      .replace("{FILL_2}", isReciprocal ? "#7A0BE0" : "#ffffff")
      .replace("{FILL_3}", isReciprocal ? "#7A0BE0" : "#ffffff")
      .replace("{FILL_4}", isReciprocal ? "#ffffff" : "#7A0BE0");
    // fs.writeFileSync("new-file-svg.svg", svgPopulated);
    return sharp(Buffer.from(svgPopulated)).png().toBuffer();
  } catch (e) {
    capture(e);
  }
};
