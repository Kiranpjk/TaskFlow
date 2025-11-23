import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="pagination">
            <button
                className="btn btn-secondary btn-small"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
            >
                ← Previous
            </button>

            <span className="pagination-info">
                Page {currentPage} of {totalPages}
            </span>

            <button
                className="btn btn-secondary btn-small"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
            >
                Next →
            </button>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
