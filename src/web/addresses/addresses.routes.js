import express from "express";
import * as Controller from "./addresses.controller.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js"; 
import * as Schemas from "./addresses.validate.js";

const router = express.Router();
 router.use(authMiddleware);

router.post('/addAddress',validate({ body: Schemas.createAddressSchema }), Controller.addAddresses);
router.get('/getAddresses', Controller.getAllAddresses);
router.get('/getAddress/:addressId',validate({ params: Schemas.addressIdParamSchema }), Controller.getAddressById);
router.put('/updateAddress/:addressId',validate({ body: Schemas.updateAddressSchema ,params: Schemas.addressIdParamSchema}), Controller.updateAddress);
router.delete('/deleteAddress/:addressId',validate({ params: Schemas.addressIdParamSchema }), Controller.deleteAddress);
router.post('/setDefaultAddress/:addressId',validate({ params: Schemas.addressIdParamSchema }), Controller.setAddressDefault);


export default router;