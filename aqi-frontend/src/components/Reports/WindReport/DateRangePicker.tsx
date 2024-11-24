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

      if (rangeEnd.diff(rangeStart, 'hour') > 24) {
        setIsModalVisible(true);
      } else {
        setStartTime(`${rangeStart.format('YYYY-MM-DDTHH:mm')}:00`);
        setEndTime(`${rangeEnd.format('YYYY-MM-DDTHH:mm')}:00`);
      }
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

  const disabledStartDate = (current: dayjs.Dayjs | null): boolean => {
    const now = dayjs().tz('Asia/Kolkata');
    return current ? current.isAfter(now, 'minute') : false;
  };

  const disabledEndDate = (current: dayjs.Dayjs | null): boolean => {
    if (!current || !startTime) return false;
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const maxEnd = start.add(24, 'hour');
    return current.isBefore(start, 'minute') || current.isAfter(maxEnd, 'minute');
  };

  const disabledEndTime = (selectedEnd: dayjs.Dayjs | null) => {
    if (!selectedEnd || !startTime) return {};
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const maxEnd = start.add(24, 'hour');

    const disabledHours = selectedEnd.isSame(maxEnd, 'day')
      ? Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour > maxEnd.hour())
      : [];
    const disabledMinutes = selectedEnd.isSame(maxEnd, 'hour')
      ? Array.from({ length: 60 }, (_, i) => i).filter((minute) => minute > maxEnd.minute())
      : [];

    return {
      disabledHours: () => disabledHours,
      disabledMinutes: () => disabledMinutes,
    };
  };

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <RangePicker
          showTime
          format="YYYY-MM-DDTHH:mm"
          value={[
            startTime ? dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss') : null,
            endTime ? dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss') : null,
          ]}
          onChange={handleRangeChange}
          disabledDate={(current) =>
            startTime
              ? disabledEndDate(current)
              : disabledStartDate(current)
          }
          disabledTime={(current) =>
            startTime
              ? disabledEndTime(current)
              : {}
          }
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
        <p>You can only select a range of up to 24 hours.</p>
      </Modal>
    </>
  );
};

export default DateRangePicker;
