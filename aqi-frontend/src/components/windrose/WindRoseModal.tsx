import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import WindRoseChart from './WindRoseChart'; // Import your existing WindRoseChart component

export default function WindRoseModal(): JSX.Element {
  // State to manage modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function to show the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        WindRose Chart
      </Button>
      <Modal
        title="WindRose Chart"
        open={isModalVisible}
        onCancel={closeModal}
        footer={null} // Hides the default footer with OK/Cancel buttons
        bodyStyle={{
          padding: '16px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }} // Adjust the padding and add scroll
        centered // Centers the modal on the screen
        style={{ maxWidth: '600px', margin: '0 auto' }} // Limits the width and centers the modal
        width="90%" // Makes the modal width responsive
      >
        <div className="windrose-chart-container">
          <WindRoseChart latitude={52.52} longitude={13.41} />
        </div>
      </Modal>
    </div>
  );
}
