import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useAuthStatus = (): [
	boolean,
	Dispatch<SetStateAction<boolean>>
] => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch("/auth-status");
			if (response.ok) {
				const data = (await response.json()) as any;
				setIsLoggedIn(data.isLoggedIn);
			} else {
				console.error("Failed to check auth status");
			}
		} catch (error) {
			console.error("Error checking auth status:", error);
		}
	};

	useEffect(() => {
		checkAuthStatus();
	}, []);

	return [isLoggedIn, setIsLoggedIn];
};
