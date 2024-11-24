import React from 'react';
import { DatePicker, Modal, Row, Col, Button, Typography } from 'antd';
import dayjs from 'dayjs';
import './DateRangePicker.css';

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
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setStartTime(`${date.format('YYYY-MM-DDTHH:mm')}:00`);
    }
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      if (dayjs(date).isBefore(dayjs(startTime))) {
        Modal.error({
          title: 'Invalid Time Range',
          content: 'End time must be after start time.',
        });
        return;
      }
      setEndTime(`${date.format('YYYY-MM-DDTHH:mm')}:00`);
    }
  };

  const disabledDate = (current: dayjs.Dayjs | null): boolean => {
    const now = dayjs();
    return current ? current.isAfter(now, 'minute') : false; // Only disallow future dates
  };

  return (
    <div className="date-range-picker-container">
      <Typography.Text className="date-range-picker-label">
        Select Date and Time Range:
      </Typography.Text>
      <Row gutter={16} className="date-range-picker-row">
        <Col xs={24} sm={12} className="date-range-picker-col">
          <Text className="date-picker-label">Start Date:</Text>
          <DatePicker
            className="custom-date-picker"
            showTime
            format="DD MMM YYYY, HH:mm"
            value={startTime ? dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss') : null}
            onChange={handleStartDateChange}
            disabledDate={disabledDate}
          />
        </Col>
        <Col xs={24} sm={12} className="date-range-picker-col">
          <Text className="date-picker-label">End Date:</Text>
          <DatePicker
            className="custom-date-picker"
            showTime
            format="DD MMM YYYY, HH:mm"
            value={endTime ? dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss') : null}
            onChange={handleEndDateChange}
            disabledDate={disabledDate}
          />
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={onSubmit}
        className="date-range-picker-submit-button"
      >
        Submit
      </Button>

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
