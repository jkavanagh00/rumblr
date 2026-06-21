# Product rules

## Questions and Mismatches

1. Questions take the form of a statement which the user is prompted to respond to:
   - The user selects on a scale of 1: strongly disagree, 2: disagree, 3: neutral, 4: agree, 5: strongly agree
   - The user also selects on a scale of 1-5, how strongly they feel about their answer.
2. When calculating mismatches, these scores are compared to produce an "opposition" value of 0-100
   - 0(no opposition) to 100(maximum opposition)
   - disagreement = absolute difference in disagreement scores (0-4)
   - weight = average of both users importance scores
   - mismatchScore = weighted disagreement / weighed maximum, converted to 0-100 score
3. Users must answer a minimum of 20 questions in order to establish a baseline for comparison
   - 20 standard mandatory questions will be presented to each user during onboarding, ensuring a minimal overlap
   - Mismatches with higher scores will be listed before lower scores
   - The lowest score that we will mismatch users based on is 50%
4. Mismatches will be calculated and stored in a "mismatches" table
   - values stored in mismatches:
      - 
   - When mismatches are recalculated and values change, the mismatch will be rewritten with the updated data
   - In future, we may consider retaining mismatches for 30-90 days for debugging, auditing, analytics and rollbacks
5. A confidence score will be assigned based on the number of shared questions between each user, and mismatches with higher confidence scores will be listed before lower scores
   - 0-19: insufficient data
   - 20-39: low confidence
   - 40-69: medium confidence
   - 70+: high confidence
