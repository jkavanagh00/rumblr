/*
all controllers related to statements should be here

examples:

- getUnansweredStatement
- submitAnswer
- addStatement?
*/

import {
  addStatement_model,
  getStatementById_model,
  listStatements_model,
  updateStatement_model,
  deleteStatement_model,
  getStatementWithNoResponse_model,
  getOnboardingStatement_model,
  getOnboardingProgress_model,
} from "../models/statements.js";

export async function getStatementWithNoResponse_controller(req, res, next) {
  try {
    const statement = await getStatementWithNoResponse_model(req.user.id);

    if (!statement) {
      return res.status(200).json({
        error:
          "You have responded to all of our statements! Maybe go and touch grass?",
      });
    }

    return res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function addStatement_controller(req, res, next) {
  try {
    const statement = await addStatement_model(req.validatedBody);
    return res.status(201).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function getStatementById_controller(req, res, next) {
  try {
    const id = req.params.id;
    const statement = await getStatementById_model(id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    return res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function listStatements_controller(req, res, next) {
  try {
    const statements = await listStatements_model(req.validatedQuery);
    return res.status(200).json(statements);
  } catch (error) {
    next(error);
  }
}

export async function updateStatement_controller(req, res, next) {
  try {
    const statement = await getStatementById_model(req.params.id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }
    const updatedStatement = await updateStatement_model(
      req.params.id,
      req.validatedBody,
    );
    return res.status(200).json(updatedStatement);
  } catch (error) {
    next(error);
  }
}

export async function deleteStatement_controller(req, res, next) {
  try {
    const statement = await getStatementById_model(req.params.id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }
    const deletedStatement = await deleteStatement_model(req.params.id);
    return res.status(200).json(deletedStatement);
  } catch (error) {
    next(error);
  }
}

export async function getOnboardingStatement_controller(req, res, next) {
  try {
    const statementNumber = Number(req.params.number);

    if (Number.isNaN(statementNumber)) {
      return res
        .status(400)
        .json({ error: "Onboarding statement number must be a number" });
    }

    if (statementNumber < 1 || statementNumber > 10) {
      return res.status(400).json({
        error:
          "Onboarding statement number must be a whole number between one and ten",
      });
    }

    const onboardingProgress = await getOnboardingProgress_model(req.user.id);

    if (
      !onboardingProgress.completed &&
      statementNumber !== onboardingProgress.nextNumber
    ) {
      return res.status(409).json({
        error: `You must answer onboarding statement ${onboardingProgress.nextNumber} next`,
        nextNumber: onboardingProgress.nextNumber,
      });
    }

    const statement = await getOnboardingStatement_model(statementNumber);

    if (!statement) {
      return res
        .status(404)
        .json({ error: "No onboarding statement with that number exists." });
    }

    return res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
}
