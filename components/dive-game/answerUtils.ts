const ignoredAnswerWords = new Set(["the", "a", "an", "in"]);

export function normalizeRawAnswer(value: string) {
  return value.trim().toLowerCase().split(/\s+/).join(" ");
}

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !ignoredAnswerWords.has(word))
    .join(" ");
}

export function isCloseAnswer(input: string, candidate: string) {
  const inputWords = normalizeAnswer(input).split(/\s+/).filter(Boolean);
  const candidateWords = normalizeAnswer(candidate)
    .split(/\s+/)
    .filter(Boolean);
  return (
    inputWords.length === candidateWords.length &&
    inputWords.every(
      (word, index) => editDistance(word, candidateWords[index]) <= 2,
    )
  );
}

function editDistance(left: string, right: string) {
  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    for (let index = 0; index < current.length; index += 1) {
      previous[index] = current[index];
    }
  }
  return previous[right.length];
}
