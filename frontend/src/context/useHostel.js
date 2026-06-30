import { useContext } from 'react';
import { HostelContext } from './HostelContext';

export const useHostel = () => {
    const context = useContext(HostelContext);
    if (context === undefined) {
        throw new Error('useHostel must be used within a HostelProvider');
    }
    return context;
};
