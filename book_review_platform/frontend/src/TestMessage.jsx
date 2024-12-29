import React from 'react';
import { message, Button } from 'antd';

const TestMessage = () => {
  const showMessage = () => {
    message.success('This is a success message!');
  };

  return (
    <div>
      <Button onClick={showMessage}>Show Success Message</Button>
    </div>
  );
};

export default TestMessage;
