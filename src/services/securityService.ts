import axios from "axios";
import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

interface AuthSession {
    access_token: string;
    token_type?: string;
    user: User;
}

class SecurityService extends EventTarget {
    private readonly keyToken: string;
    private readonly userKey: string;
    private readonly API_URL: string;
    private user: User | null;
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        super();

        this.storage = storage;
        this.keyToken = "token";
        this.userKey = "user";
        this.API_URL = this.resolveSecurityApiUrl();
        this.user = this.loadStoredUser();
    }

    private resolveSecurityApiUrl(): string {
        const securityUrl = import.meta.env.VITE_API_URL_SECURITY;
        const apiUrl = import.meta.env.VITE_API_URL;

        if (securityUrl && securityUrl.trim()) {
            return securityUrl.replace(/\/+$/, "");
        }

        if (apiUrl && apiUrl.trim()) {
            return `${apiUrl.replace(/\/+$/, "")}/auth`;
        }

        return "/api/auth";
    }

    private loadStoredUser(): User | null {
        const storedUser = this.storage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Error parsing stored user:", error);
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    async login(user: User) {
        const response = await axios.post(`${this.API_URL}/login`, user, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            throw new Error(`Login failed with status ${response.status}`);
        }

        const data = response.data?.data ?? response.data;
        return this.setSession({
            access_token: data?.access_token ?? data?.token,
            token_type: data?.token_type,
            user: data.user,
        });
    }

    setSession(session: AuthSession) {
        this.user = session.user;

        this.storage.setItem(this.userKey, JSON.stringify(this.user));
        this.storage.setItem(this.keyToken, session.access_token);

        store.dispatch(setUser(this.user));
        this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

        return {
            access_token: session.access_token,
            token_type: session.token_type ?? "Bearer",
            user: this.user,
        };
    }

    getUser() {
        return this.user;
    }

    logout() {
        this.user = null;

        this.storage.clear();

        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        store.dispatch(setUser(null));
    }

    isAuthenticated() {
        return this.storage.getItem(this.keyToken) !== null;
    }

    getToken() {
        return this.storage.getItem(this.keyToken);
    }
}

export default new SecurityService();