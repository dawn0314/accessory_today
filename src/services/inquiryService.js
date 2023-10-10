import { Inquiries } from "../db/models/productModel.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId; //ObjectId 형식으로 변환

class InquiryService {
    async getInquiry(productId, getAll) {
      try {
        let data = {};
        if (getAll) { // 전부 가져오기
          data = await Inquiries.find({ productId }).populate('productId');
        } else { // 일부만 가져오기
          data = await Inquiries.find({ productId }).limit(2);
        }
        return data;
      } catch (error) {
        console.error('getInquiry 오류:', error);
        return error;
      }
    }
  
    async putInquiry(title, author, content, productId) {
      try {

        const data = {
          title,
          author,
          content,
          productId
        };
        
        await Inquiries.findOneAndUpdate({ productId, author }, data, { upsert: true });
        return ;
      } catch (error) {
        console.error('putInquiry 오류:', error);
        return error;
      }
    }
  
    async delInquiry(Id) {
      try {
        
        await Inquiries.deleteOne({ _id: new ObjectId(Id) });

        return ;
      } catch (error) {
        console.error('delInquiry 오류:', error);
        return error;
      }
    }
  }
  
  const inquiryService = new InquiryService();
  
  export { inquiryService };