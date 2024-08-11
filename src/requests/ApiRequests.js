

import axios from 'axios';
import { useNavigate ,useLocation} from 'react-router-dom';

// Create an axios instance with default configurations
const apiConfig = axios.create({
    baseURL: 'http://localhost:4000',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Set this globally if you need it for all requests
  });
  
export const uploadPeople = async (data) => {
  try {
    const response = await apiConfig.post('/api/alfon/upload', data);
   
    return response;
  } catch (error) {
    console.log(error);
    
  }
};

export const getPeople = async () => {
  try {
    const response = await apiConfig.get('/api/alfon');
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const uploadCommitment = async (data) => {
  try {
    const response = await apiConfig.post('/api/commitment/upload', data);
   
    return response;

  } catch (error) {
    console.log(error);
    
  }
};

export const getCommitment = async () => {
  try {
    const response = await apiConfig.get('/api/commitment');
    return response;
  } catch (error) {
    console.log(error);
  }
}

export const getUserDetails = async (anashIdentifier) => {
  try {
    console.log(anashIdentifier);
    const response = await apiConfig.get(`/api/alfon/get-user-details/${anashIdentifier}`);

    return response;
  } catch (error) {
    console.log(error);
  }
};
export const upadateUserDetails = async (data) => {
  try {
    console.log('e',data);
    const response = await apiConfig.post(`/api/alfon/update-user-details`,data);

    return response;
  } catch (error) {
    console.log(error);
  }
}
