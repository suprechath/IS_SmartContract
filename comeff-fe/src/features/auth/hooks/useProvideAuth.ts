// src/features/auth/hooks/useProvideAuth.ts
import { useState, useEffect, use } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { el } from 'date-fns/locale';

interface User {
    id: string;
    role: 'Investor' | 'Project Creator';
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

export const useProvideAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // <-- Import and use the router

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');
        const storedUserObj = storedUser ? JSON.parse(storedUser) : null;

        if (storedToken && storedUserObj) {
            setToken(storedToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            console.log("Found existing token in localStorage, fetching user data...");
            if (storedUserObj.sanction_status !== 'Verified') {
                alert('Your account is pending verification.\nYou will be redirected to the Pending Verification page.');
                router.push('/pending-verification');
            }
        }
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');
        const storedUserObj = storedUser ? JSON.parse(storedUser) : null;
        if (!storedToken && !storedUserObj) {
            setUser(null);
            setToken(null);
            delete api.defaults.headers.common['Authorization'];
            console.log("No token found in localStorage, user is logged out.");
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
            const { token: jwtToken, user: userData } = verifyRes.data.data;

            setToken(jwtToken);
            setUser(userData.sanction_status);
            api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

            // Store token in localStorage for persistence
            localStorage.setItem('jwt_token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));
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
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        disconnect();
        console.log("User logged out successfully.");
    };

    return { user, token, register, login, logout, isLoading, error, setError };
};