import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatEngine } from 'react-chat-engine';
import { auth } from '../firebase';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

const Chats = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	console.log(loading);

	const handleLogout = async () => {
		await auth.signOut();

		navigate('/');
	};

	const getFile = async url => {
		const response = await fetch(url);
		const data = await response.blob();

		return new File([data], 'userPhoto.jpg', { type: 'image/jpeg' });
	};

	useEffect(() => {
		if (!user) {
			navigate('/');

			return;
		}

		axios
			.get('https://api.chatengine.io/users/me', {
				headers: {
					'project-id': process.env.REACT_APP_CHAT_ENGINE_ID,
					'user-name': user.email,
					'user-secret': user.uid,
				},
			})
			.then(() => {
				setLoading(false);
			})
			.catch(() => {
				let formData = new FormData();
				formData.append('email', user.email);
				formData.append('username', user.email);
				formData.append('secret', user.uid);

				getFile(user.photoURL).then(avatar => {
					formData.append('avatar', avatar, avatar.name);

					axios
						.post('https://api.chatengine.io/users/', formData, {
							headers: { 'private-key': process.env.REACT_APP_CHAT_ENGINE_KEY },
						})
						.then(() => setLoading(false))
						.catch(error => console.log(error));
				});
			});
	}, [user, navigate]);

	if (!user || loading) return 'Loading...';
	return (
		<div className='chats-page'>
			<div className='nav-bar'>
				<div className='logo-tab'>Unichat</div>
				<div onClick={handleLogout} className='logout-tab'>
					Logout
				</div>
			</div>

			<ChatEngine
				height='calc(100vh - 66px)'
				projectID={process.env.REACT_APP_CHAT_ENGINE_ID}
				userName={user.email}
				userSecret={user.uid}
			/>
		</div>
	);
};
export default Chats;
