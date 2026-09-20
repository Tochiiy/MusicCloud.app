import mongoose, { Schema , Document} from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
    likedSongs: string[];
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
    likedSongs: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});


export const User = mongoose.model<IUser>('User', userSchema);

interface IBlacklistedToken extends Document {
    token: string;
    expiresAt: Date;
}

const blacklistedTokenSchema: Schema<IBlacklistedToken> = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model<IBlacklistedToken>('BlacklistedToken', blacklistedTokenSchema);