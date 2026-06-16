/**
 * @param {Array} sharedResponses - An array of shared response objects, where each object contains the following properties:
 * - question_id: The ID of the question being compared.
 * - user1_agreement_score: The agreement score of the first user for the question.
 * - user1_importance_score: The importance score of the first user for the question.
 * - user2_agreement_score: The agreement score of the second user for the question.
 * - user2_importance_score: The importance score of the second user for the question.
 * @returns {object} - Mismatch percentage and confidence level between the two users
 */

export function calculateMismatchScore(sharedResponses) {
  const totalResponses = sharedResponses.length;
  if (totalResponses < 20) {
    return {
      mismatchPercentage: null,
      confidence: null,
      totalResponses,
    };
  }

  // stores both the total weighted difference and the maximum possible weighted difference, which is used to calculate the mismatch percentage
  let total = 0;
  let maxTotal = 0;

  sharedResponses.forEach((response) => {
    const comparison = compareSharedResponse(response);
    total += comparison.weightedDifference;
    maxTotal += comparison.maxWeightedDifference;
  });

  // calculate the mismatch percentage by dividing the total weighted difference by the maximum possible weighted difference and multiplying by 100 to get a percentage
  return {
    mismatchPercentage: Math.round((total / maxTotal) * 100),
    confidence:
      totalResponses > 70 ? "high" : totalResponses > 40 ? "medium" : "low",
    totalResponses,
  };
}

function compareSharedResponse(sharedResponse) {
  // absolute difference between agreement scores
  const disagreement = Math.abs(
    sharedResponse.user1_agreement_score - sharedResponse.user2_agreement_score,
  );
  // average importance score as the weight for the disagreement
  const weight =
    (sharedResponse.user1_importance_score +
      sharedResponse.user2_importance_score) /
    2;
  // weighted difference between the two users' responses
  const weightedDifference = disagreement * weight;
  // maximum possible disagreement, given importance scores
  const maxWeightedDifference = 4 * weight;
  return {
    weightedDifference,
    maxWeightedDifference,
  };
}