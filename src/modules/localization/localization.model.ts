import { Schema, model } from 'mongoose';

const languageSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: String,
    nativeName: String,
    direction: { type: String, enum: ['ltr', 'rtl'], default: 'ltr' },
    enabled: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    completeness: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default model('Language', languageSchema);
