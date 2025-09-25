import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
text: String,
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Message', messageSchema);