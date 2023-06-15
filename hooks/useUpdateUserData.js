import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectedUserId,
  IpAddress,
} from '../../redux/features/mainSlice/mainSlice';

function useUpdateUserData() {
  const [userId, setUserId] = useState({});
  const currentSelectedUserId = useSelector(selectedUserId);
  const clientIpAddress = useSelector(IpAddress);

  const updateUser = async (updatedData) => {
    try {
      const response = await axios.put(
        `http://${clientIpAddress}:3001/user/${currentSelectedUserId}`,
        updatedData
      );

      setUserId(response.data);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      throw error;
    }
  };

  return { userId, updateUser };
}

export default useUpdateUserData;
