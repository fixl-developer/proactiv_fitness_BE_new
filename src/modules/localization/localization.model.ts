import { Schema, model } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

const languageSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: String,
    nativeName: String,
    direction: { type: String, enum: ['ltr', 'rtl'], default: 'ltr' },
    enabled: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    completeness: Number,
}, baseSchemaOptions);

const translationSchema = new Schema({
    key: { type: String, required: true },
    language: { type: String, required: true },
    translation: { type: String, default: '' },
    namespace: { type: String, default: 'common' },
    isApproved: { type: Boolean, default: false },
}, baseSchemaOptions);

translationSchema.index({ key: 1, language: 1 }, { unique: true });
translationSchema.index({ namespace: 1, language: 1 });

const localizedContentSchema = new Schema({
    contentType: { type: String, required: true },
    contentId: { type: String, required: true },
    language: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
}, baseSchemaOptions);

localizedContentSchema.index({ contentType: 1, contentId: 1, language: 1 }, { unique: true });

const currencyRateSchema = new Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    rate: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
}, baseSchemaOptions);

currencyRateSchema.index({ from: 1, to: 1 }, { unique: true });

const Language = model('Language', languageSchema);
const Translation = model('Translation', translationSchema);
const LocalizedContent = model('LocalizedContent', localizedContentSchema);
const CurrencyRate = model('CurrencyRate', currencyRateSchema);

export default Language;
export { Translation, LocalizedContent, CurrencyRate };
