/*
all models related to questions should be here

examples:

- listQuestions
- findQuestionById
- findUnansweredQuestion
- createQuestion?
- updateQuestion?
- removeQuestion?
*/
import db from "./../database/db.js";

const TABLE = 'questions'

function baseQuery(trx = db) {
    return trx(TABLE);
}

export async function getQuestion() {
    const qb = baseQuery();
    const user = qb.accounts()
    const answeredQuestions = qb.select('*').where()
    const unansweredQuestions = qb.select('*').where
}

export async function listAllQuestions(trx = db) {
    const qb = baseQuery(trx);
    const questions = await qb.select('*');
    return questions.length > 0 ? questions : null;
};