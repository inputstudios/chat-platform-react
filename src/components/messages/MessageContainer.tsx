import React, { useContext, useEffect, useRef, useState } from "react";
import {
	MessageContainerStyle,
	MessageItemContainer,
	MessageItemContent,
} from "../../utils/styles"
import { GroupMessageType, MessageType } from "../../utils/types";
import { AuthContext } from "../../utils/context/AuthContext";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useParams } from 'react-router-dom';
import { SelectedMessageContextMenu } from '../context-menus/SelectedMessageContextMenu';
import { FormattedMessage } from "./FormattedMessage";
import { EditMessageContainer } from "./EditMessageContainer";
import { selectConversationMessage } from "../../store/messageSlice";
import { selectType } from "../../store/selectedSlice";
import { selectGroupMessage } from '../../store/groupMessageSlice';
import { 
	editMessageContent, 
	resetMessageContainer, 
	setIsEditing, 
	setSelectedMessage,
} from "../../store/messageContainerSlice";

export const MessageContainer = () => {
	const { id } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const conversationMessages = useSelector((state: RootState) => 
		selectConversationMessage(state, parseInt(id!))
	);
	const groupMessages = useSelector((state: RootState) => 
		selectGroupMessage(state, parseInt(id!))
	);
	const selectedType = useSelector((state: RootState) => selectType(state));
	const [showMenu, setShowMenu] = useState(false);
	const [points, setPoints] = useState({ x: 0, y: 0 });
	const { user } = useContext(AuthContext);
	const ref = useRef<HTMLDivElement>(null);

	const { isEditingMessage, messageBeingEdited } = useSelector(
		(state: RootState) => state.messageContainer
	);

	const onContextMenu = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>, 
		message: MessageType | GroupMessageType
	) => {
		e.preventDefault();
		setShowMenu(true);
		setPoints({ x: e.pageX, y: e.pageY });
		dispatch(setSelectedMessage(message));
	};

	const onEditMessageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		dispatch(editMessageContent(e.target.value));

	useEffect(() => {
		const handleClick = () => setShowMenu(false);
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, [id]);

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => 
			e.key === 'Escape' && dispatch(setIsEditing(false));
		window.addEventListener('keydown', handleKeydown);
		return () => {
			console.log('Removing keydown event listener');
			window.removeEventListener('keydown', handleKeydown);
		};
	}, [id]);

	useEffect(() => {
		return () => {
			console.log('Unmounting');
			dispatch(resetMessageContainer());
		};
	}, [id]);

	const mapMessages = (
		message: MessageType | GroupMessageType,
		index: number,
		messages: MessageType[] | GroupMessageType[]
	) => {
		const currentMessage = messages[index];
		const nextMessage = messages[index + 1];
		const showMessageHeader = 
			messages.length === index + 1 || 
			currentMessage.author.id !== nextMessage.author.id;
		return ( 
				<FormattedMessage 
					onContextMenu={(e) => onContextMenu(e, message)} 
					key={message.id}
					user={user}
					message={message}
					onEditMessageChange={onEditMessageChange}
				/>
			);
		if (currentMessage.author.id === nextMessage.author.id) {
			return (
				<MessageItemContainer 
					key={message.id} 
					onContextMenu={(e) => onContextMenu(e, message)} 
				>
					{isEditingMessage && message.id === messageBeingEdited?.id ? (
						<MessageItemContent padding="0 0 0 70px">
							<EditMessageContainer onEditMessageChange={onEditMessageChange} />
						</MessageItemContent>
					) : (
						<MessageItemContent padding="0 0 0 70px">
							{message.content}
						</MessageItemContent>
					)}
				</MessageItemContainer>
			);
		}
	};

	const formatMessages = () => {
		if (selectedType === 'private')
			return conversationMessages?.messages.map(mapMessages);
		return groupMessages?.messages.map(mapMessages);
	};

	return (
		<MessageContainerStyle 
			onScroll={(e) => {
				const node = e.target as HTMLDivElement;
				const scrollTopMax  = node.scrollHeight - node.clientHeight;
				if (-scrollTopMax === node.scrollTop) {
					console.log('');
				}
			}}
		>
			<>
				{selectedType === 'private'
					? conversationMessages?.messages.map(mapMessages)
					: groupMessages?.messages.map(mapMessages)}
				</>
			{showMenu && <SelectedMessageContextMenu points={points} />}
		</MessageContainerStyle>
	);
};
