import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type UserIdentity = {
	id: number;
	email: string;
	verifiedEmail: boolean;
	name: string;
	givenName: string;
	familyName: string;
	picture: string;
};

export const useAuthStatus = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch("/auth-status");

			if (response.ok) {
				const data = await response.json();

				setIsLoggedIn(data.isLoggedIn);
				setUserIdentity({
					id: data.user.id,
					email: data.user.email,
					verifiedEmail: data.user.verified_email,
					name: data.user.name,
					givenName: data.user.given_name,
					familyName: data.user.family_name,
					picture: data.user.picture,
				});
			} else {
				console.error("Failed to check auth status");
			}
		} catch (error) {
			console.error("Error checking auth status:", error);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		checkAuthStatus();
	}, []);

	return {
		isLoggedIn,
		setIsLoggedIn,
		userIdentity,
		setUserIdentity,
	};
};
