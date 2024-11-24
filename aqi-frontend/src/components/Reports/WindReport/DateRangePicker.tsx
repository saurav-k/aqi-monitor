import React from 'react';
import { DatePicker, Modal, Space, Button, Typography } from 'antd';
import dayjs from 'dayjs';
import './DateRangePicker.css'; // Import the updated CSS file

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DateRangePickerProps {
  startTime: string;
  endTime: string;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
  onSubmit: () => void;
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  onSubmit,
  isModalVisible,
  setIsModalVisible,
}) => {
  const handleRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      const rangeStart = dates[0];
      const rangeEnd = dates[1];

      if (rangeEnd.isBefore(rangeStart)) {
        Modal.error({
          title: 'Invalid Time Range',
          content: 'End time must be after start time.',
        });
      } else {
        setStartTime(`${rangeStart.format('YYYY-MM-DDTHH:mm')}:00`);
        setEndTime(`${rangeEnd.format('YYYY-MM-DDTHH:mm')}:00`);
      }
    }
  };

  const disabledDate = (current: dayjs.Dayjs | null): boolean => {
    const now = dayjs();
    return current ? current.isAfter(now, 'minute') : false; // Only disallow future dates
  };

  return (
    <div className="date-range-picker-container">
      <Space direction="vertical" className="date-range-picker-space">
        <Text className="date-range-picker-label">Select Date and Time Range:</Text>
        <RangePicker
          className="custom-range-picker"
          showTime
          format="DD MMM YYYY, HH:mm"
          value={[
            startTime ? dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss') : null,
            endTime ? dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss') : null,
          ]}
          onChange={handleRangeChange}
          disabledDate={disabledDate}
        />
        <Button
          type="primary"
          onClick={onSubmit}
          className="date-range-picker-button"
        >
          Apply Range
        </Button>
      </Space>

      <Modal
        title="Invalid Time Range"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>You can only select a valid time range.</p>
      </Modal>
    </div>
  );
};

export default DateRangePicker;
