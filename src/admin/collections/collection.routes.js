import express from "express";
import * as Controller from "./collection.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { addCollectionSchema, collectionIdSchema, updateCollectionSchema } from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/addCollection',validate({ body: addCollectionSchema }), Controller.addCollection);

router.get('/getCollections', Controller.getAllCollections);

router.put('/updateCollection/:id',validate({ body: updateCollectionSchema ,params: collectionIdSchema}), Controller.updateCollection);

router.delete('/deleteCollection/:id',validate({ params: collectionIdSchema }), Controller.deleteCollection);

export default router;
