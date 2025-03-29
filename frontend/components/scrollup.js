import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTopButton = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle the scroll event to show/hide the button
  useEffect(() => {
    const handleScroll = () => {
      // Show the button when the user scrolls down 100px from the top
      setShowScrollButton(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll to top button */}
      {showScrollButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-50"
        >
          <FiArrowUp className="text-xl text-white" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
