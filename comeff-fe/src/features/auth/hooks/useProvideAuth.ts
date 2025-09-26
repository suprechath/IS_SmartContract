// src/features/auth/hooks/useProvideAuth.ts
import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    role: string;
    wallet_address: string;
    sanction_status: string;
}

interface RegisterFormData {
    full_name: string;
    date_of_birth: Date | undefined;
    address: string;
    identification_number: string;
    email: string;
    wallet_address: string;
    role: 'Investor' | 'Project Creator';
}

const setAuthToken = (token: string | null, expiresAt: string | null, user: User | null) => {
    if (token && expiresAt && user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('jwt_expires_at', expiresAt);
        localStorage.setItem('user', JSON.stringify(user));
        document.cookie = `jwt_token=${token}; jwt_expires_at=${expiresAt}; path=/; SameSite=Lax;`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_expires_at');
        localStorage.removeItem('user');
        document.cookie = 'jwt_token=; jwt_expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        delete api.defaults.headers.common['Authorization'];
    }
};

export const useProvideAuth = () => {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // <-- Import and use the router

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedExpiresAt = localStorage.getItem('jwt_expires_at');
        const storedUser = localStorage.getItem('user');
        const storedUserObj = storedUser ? JSON.parse(storedUser) : null;

        if (storedToken && storedUserObj && storedExpiresAt && new Date().getTime() < new Date(storedExpiresAt).getTime()) {
            setToken(storedToken);
            setUser(storedUserObj.sanction_status);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            console.log("Found existing token in localStorage, fetching user data...");
            if (storedUserObj.sanction_status !== 'Verified') {
                router.push('/pending-verification');
            }
        } else {
            logout();
        }
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');
        if (!storedToken && !storedUser) {
            setUser(null);
            setToken(null);
            setAuthToken(null, null, null);
            console.log("No token found in localStorage, user is logged out.");
            router.refresh();
        }
    }, [isConnected]);

    const register = async (formData: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/users/register', formData);
            if (response.status === 201) {
                console.log("Registration successful:", response.data);
                alert('Registration and login successful!');
                //automatically log the user in after registration
                const loginResult = await login();
                if (loginResult.success) {
                    return { success: true, user: loginResult.user };
                } else {
                    // This case might happen if login fails right after registration, though unlikely.
                    setError('Registration successful, but login failed. Please try logging in manually.');
                    return { success: false, error: 'Post-registration login failed.' };
                }
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
            console.error("Registration failed:", errorMessage);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const login = async () => {
        if (!address) {
            setError('Wallet not connected');
            return { success: false, error: 'Wallet is not connected.' };
        }
        setIsLoading(true);
        setError(null);

        try {
            const nonceRes = await api.get(`/auth/nonce/${address}`);
            const { nonceToken } = nonceRes.data.data;
            if (!nonceToken) {
                throw new Error("Nonce not received from the server.");
            }

            alert('Please sign the message in the MetaMask popup...');
            const signature = await signMessageAsync({ message: nonceToken });

            const verifyRes = await api.post('/auth/verify', { nonceToken, signature });
            const { token: jwtToken, user: userData, expiresAt } = verifyRes.data.data;

            setToken(jwtToken);
            setUser(userData.sanction_status);
            api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

            // Store token in localStorage for persistence
            setAuthToken(jwtToken, expiresAt, userData);
            console.log(`The address of ${userData.wallet_address} has logged in as ${userData.role} successfully.`);

            if (userData.sanction_status !== 'Verified') {
                alert('Your account is pending verification.\nYou will be redirected to the Pending Verification page.');
                router.push('/pending-verification');
            }

            return { success: true, user: userData };

        } catch (err: any) {
            if (err.name === 'UserRejectedRequestError') {
                setError('Login failed: You rejected the signature request.');
                return { success: false, error: 'User rejected request.' };
            }
            const errorMessage = err.response?.data?.message || 'An unknown error occurred during login.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setAuthToken(null, null, null);
        disconnect();
        console.log("User logged out successfully.");
    };

    const verifySanctionStatus = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const sanctionResponse = await api.get('/sanctions/check');
            const userData = sanctionResponse.data.data.isSanctioned;
            console.log("Sanction status:", userData);
            const updatedUser = userData ? "Rejected" : "Verified";
            localStorage.setItem('user', JSON.stringify({ ...user, sanction_status: updatedUser }));
            setUser(updatedUser);
            console.log("user is:", updatedUser);
        } catch (err) {
            console.error("Failed to verify sanction status:", err);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    return { user, token, register, login, logout, isLoading, error, setError, verifySanctionStatus };
};