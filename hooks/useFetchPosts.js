import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  selectedSubGroup,
  IpAddress,
} from '../../redux/features/mainSlice/mainSlice';

// Custom hook for fetching user data
export default function useFetchPosts() {
  const clientIpAddress = useSelector(IpAddress);
  const selectedSubGroupValue = useSelector(selectedSubGroup);
  const [posts, setPosts] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://${clientIpAddress}:3001/subgroup/${selectedSubGroupValue.subgroupId}/posts`
        );
        setPosts(res.data);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };

    fetchPosts();
  }, [clientIpAddress, selectedSubGroupValue]);

  return posts;
}
