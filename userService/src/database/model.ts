import mongoose, { Schema , Document} from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}



const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    playlist: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});


export const User = mongoose.model<IUser>('User', userSchema);