import { Outlet, useNavigate } from "react-router-dom";
import { UserSidebar } from "../components/sidebars/UserSidebar"
import { useContext, useEffect } from "react";
import { SocketContext } from "../utils/context/SocketContent";
import { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { 
	addFriendRequest, 
	removeFriendRequest, 
} from "../store/friends/friendsSlice";
import { LayoutPage } from "../utils/styles";
import { useToast } from "../utils/hooks/useToast";
import { AcceptFriendRequestResponse, FriendRequest } from "../utils/types";
import { IoMdPersonAdd } from 'react-icons/io';
import { BsFillPersonCheckFill } from 'react-icons/bs';

export const AppPage = () => {
	const socket = useContext(SocketContext);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { info } = useToast({ theme: 'dark' });
	useEffect(() => {
		socket.on('onFriendRequestReceived', (payload: FriendRequest) => {
			console.log('onFriendRequestReceived');
			console.log(payload);
			dispatch(addFriendRequest(payload));
			info(`Incoming Friend Request from ${payload.sender.firstName}`, { 
				position: 'bottom-left', 
				icon: IoMdPersonAdd,
				onClick: () => navigate('/friends/requests'),
			});
		});

		socket.on('onFriendRequestCancelled', (payload: FriendRequest) => {
			console.log('onFriendRequestCancelled');
			console.log(payload);
			dispatch(removeFriendRequest(payload));
		});

		socket.on(
			'onFriendRequestAccepted', 
			(payload: AcceptFriendRequestResponse) => {
				console.log('onFriendRequestAccepted');
				dispatch(removeFriendRequest(payload.friendRequest));
				info(
					`${payload.friendRequest.receiver.firstName} accepted your friend request`,
					{ 
						position: 'bottom-left', 
						icon: BsFillPersonCheckFill,
						onClick: () => navigate('/friends'),
					}
				);
			}
		);

		socket.on('onFriendRequestRejected', (payload: FriendRequest) => {
			console.log('onFriendRequestRejected');
			dispatch(removeFriendRequest(payload));
		});

		return () => {
			socket.removeAllListeners();
		};
	}, []);

	return (
		<LayoutPage>
			<UserSidebar />
			<Outlet />
		</LayoutPage>
	);
};
