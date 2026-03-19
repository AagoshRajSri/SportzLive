import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, ListCommentaryQuerySchema } from "../validation/commentary.js";

// mergeParams allows us to access :id from the parent router path
export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
        return res.status(400).json({ error: "Invalid parameters", details: JSON.stringify(paramsParsed.error) });
    }

    const queryParsed = ListCommentaryQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: JSON.stringify(queryParsed.error) });
    }

    try {
        const matchId = paramsParsed.data.id;
        const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.status(200).json({ data });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch commentary list", details: JSON.stringify(e) });
    }
});

commentaryRouter.post('/', async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
        return res.status(400).json({ error: "Invalid parameters", details: JSON.stringify(paramsParsed.error) });
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body);

    if (!bodyParsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: JSON.stringify(bodyParsed.error) });
    }

    try {
        const matchId = paramsParsed.data.id;
        const { minutes, ...restData } = bodyParsed.data;

        const [newCommentary] = await db
            .insert(commentary)
            .values({
                matchId,
                minute: minutes ?? 0, // Fallback since DB schema uses 'minute' and requires it
                sequence: restData.sequence ?? 0, // Required in DB
                period: restData.period ?? '1', // Required in DB 
                eventType: restData.eventType ?? 'info', // Required in DB
                ...restData
            })
            .returning();

        if (res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(result.matchId, result)
        }

        res.status(201).json({ data: newCommentary });
    } catch (e) {
        res.status(500).json({ error: "Failed to create commentary", details: JSON.stringify(e) });
    }
});