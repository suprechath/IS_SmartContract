// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { recoverMessageAddress } from 'viem';
import api from '@/lib/api';
import axios from 'axios';

interface User {
    id: string;
    role: 'Investor' | 'Project Creator';
    wallet_address: string;
    sanction_status: string;
}

interface RegisterFormData {
    full_Name: string;
    date_of_birth: Date | undefined;
    address: string;
    identification_number: string;
    email: string;
    wallet_address: string;
    role: 'Investor' | 'Project Creator';
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();

    const register = async (formData: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Registering user with data:", formData);
            const registerResponse = await axios.post('http://localhost:5001/api/users/register', formData);
            if (registerResponse.status === 201) {
                console.log("Registration successful:", registerResponse.data);                
            }
            // const response = await api.post('/users/register', formData);
            // if (response.status === 201) {
            //     //automatically log the user in after registration
            //     const loginResult = await login();
            //     if (loginResult.success) {
            //         return { success: true, user: loginResult.user };
            //     } else {
            //         // This case might happen if login fails right after registration, though unlikely.
            //         setError('Registration successful, but login failed. Please try logging in manually.');
            //         return { success: false, error: 'Post-registration login failed.' };
            //     }
            // }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
            return { success: false, error: err.response?.data?.message || 'An unexpected error occurred.' };
        } finally {
            setIsLoading(false);
        }
    };

    const login = async () => {
        if (!address) {
            setError('Wallet not connected');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const nonceRes = await api.get(`/auth/nonce/${address}`);
            const { nonceToken } = nonceRes.data.data;

            const signature = await signMessageAsync({ message: nonceToken });

            const verifyRes = await api.post('/auth/verify', { nonceToken, signature });
            const { token: jwtToken, user: userData } = verifyRes.data.data;

            setToken(jwtToken);
            setUser(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

            // Store token in localStorage for persistence
            localStorage.setItem('jwt_token', jwtToken);
            return { success: true, user: userData };

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed.';
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
        disconnect();
    };

    return { user, token, register, login, logout, isLoading, error };
};