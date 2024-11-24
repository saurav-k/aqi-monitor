import React from 'react';
import { DatePicker, Modal, Space, Button } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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
    return current ? current.isAfter(now, 'minute') : false;
  };
  

  return (
    <>
      <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
        <RangePicker
          showTime
          format="YYYY-MM-DDTHH:mm"
          value={[
            startTime ? dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss') : null,
            endTime ? dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss') : null,
          ]}
          onChange={handleRangeChange}
          disabledDate={disabledDate}
        />
        <Button type="primary" onClick={onSubmit}>
          Submit
        </Button>
      </Space>

      <Modal
        title="Range Limit Exceeded"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>You can only select a valid time range.</p>
      </Modal>
    </>
  );
};

export default DateRangePicker;
