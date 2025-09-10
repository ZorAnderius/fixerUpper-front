import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviousLocation } from '../redux/pending/slice';
import { selectPreviousLocation } from '../redux/pending/selectors';

const PREVIOUS_LOCATION_KEY = 'previousLocation';
const PENDING_ITEMS_KEY = 'pendingItems';

export const usePreviousLocation = () => {
  const dispatch = useDispatch();
  const previousLocation = useSelector(selectPreviousLocation);

  // Save to sessionStorage when previousLocation changes
  useEffect(() => {
    if (previousLocation) {
      sessionStorage.setItem(PREVIOUS_LOCATION_KEY, previousLocation);
    }
  }, [previousLocation]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedLocation = sessionStorage.getItem(PREVIOUS_LOCATION_KEY);
    if (savedLocation && !previousLocation) {
      dispatch(setPreviousLocation(savedLocation));
    }
  }, [dispatch, previousLocation]);

  // Clear from sessionStorage
  const clearPreviousLocation = () => {
    sessionStorage.removeItem(PREVIOUS_LOCATION_KEY);
    sessionStorage.removeItem(PENDING_ITEMS_KEY);
  };

  return {
    previousLocation,
    clearPreviousLocation
  };
};
