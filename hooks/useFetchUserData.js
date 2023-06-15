import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  selectedUser,
  IpAddress,
} from '../../redux/features/mainSlice/mainSlice';

// Custom hook for fetching user data
export default function useFetchUserData(userId) {
  const currentUser = useSelector(selectedUser);
  const clientIpAddress = useSelector(IpAddress);
  const [userData, setUserData] = useState({});
  const [imageUpload, setImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://${clientIpAddress}:3001/user/${userId}`
        );

        // Convert Blob to Base64 string
        const blobProfileImage = response.data.profile_image
          ? `data:image/png;base64,${response.data.profile_image}`
          : null;
        setImage(blobProfileImage);
        setUserData(response.data);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };

    fetchUserData();
  }, [clientIpAddress, currentUser]);

  return { userData, imageUpload };
}
