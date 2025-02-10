import React, { useState } from 'react';
import { Popover, Select, Tag, Button } from 'antd';

  const { Option } = Select;

  const statusColorMap = {
    OPEN: 'green',
    CLOSED: 'geekblue',
    FALSE_POSITIVE: 'red',
    SUPPRESSED: 'orange',
    FIXED: 'purple',
    CONFIRM: 'magenta',
  };
  
  const getStatesByTool = (toolType) => {
    switch (toolType) {
      case 'DEPENDABOT':
        return ['open', 'dismissed'];
      case 'CODESCAN':
        return ['open', 'dismissed'];
      case 'SECRETSCAN':
        return ['open', 'resolved'];
      default:
        return [];
    }
  };
  
  const DismissedReasonDependabot = [
    { value: 'fix_started', label: 'Fix Started' },
    { value: 'inaccurate', label: 'Inaccurate' },
    { value: 'no_bandwidth', label: 'No Bandwidth' },
    { value: 'not_used', label: 'Not Used' },
    { value: 'tolerable_risk', label: 'Tolerable Risk' },
  ];
  
  const DismissedReasonCodeScan = [
    { value: 'false positive', label: 'False Positive' },
    { value: `won't fix`, label: 'Would Not Fix' },
    { value: 'used in tests', label: 'Used In Tests' },
  ];
  
  const ResolvedReasonSecretScan = [
    { value: 'false_positive', label: 'False Positive' },
    { value: 'wont_fix', label: 'Would Not Fix' },
    { value: 'used_in_tests', label: 'Used In Tests' },
    { value: 'revoked', label: 'Revoked' },
  ];
  
  const getDismissReasonsByTool = (toolType) => {
    switch (toolType) {
      case 'DEPENDABOT':
        return DismissedReasonDependabot;
      case 'CODESCAN':
        return DismissedReasonCodeScan;
        case 'SECRETSCAN':
          return ResolvedReasonSecretScan;
      default:
        return [];
    }
  };
  const StatusPopover = ({ record, updateAlertState,canUpdateState }) => {
    const [visible, setVisible] = useState(false);
    const [tempState, setTempState] = useState(record.status?.toLowerCase());
    const [dismissReason, setDismissReason] = useState('');
  
    const possibleStates = getStatesByTool(record.toolType);
    const dismissReasons = getDismissReasonsByTool(record.toolType);
    const uuid = record.id;
    const isAlreadyDismissed = record.status === 'FALSE_POSITIVE' || record.status === 'SUPPRESSED';
    const statesToRender = possibleStates.map((st) => {
        let isDisabled = false;
        if (st.toLowerCase() === record.status.toLowerCase()) {
        isDisabled = true;
        }
        if (st === 'dismissed' && isAlreadyDismissed) {
        isDisabled = true;
        }
        return { value: st, disabled: isDisabled };
    }
 );
  
    const onSave = () => {
      const alertNumber = record.additionalData?.number;
      const requiresReason = tempState === 'dismissed' || tempState === 'resolved';
      const finalReason = requiresReason ? dismissReason || null : null;
      const tooltype= record.toolType;
      updateAlertState(uuid,alertNumber, tempState, finalReason,tooltype);
      setVisible(false);
    };
  
    const content = (
      <div style={{ minWidth: 220 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: 500 }}>
            Change Status:
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder="Select new status"
            value={tempState}
            onChange={(val) => {
              setTempState(val);
              if (!['dismissed', 'resolved'].includes(val)) {
                setDismissReason('');
              }
            }}
          >
            {statesToRender.map((stateObj) => (
              <Option
                key={stateObj.value}
                value={stateObj.value}
                disabled={stateObj.disabled}
              >
                {stateObj.value}
              </Option>
            ))}
          </Select>
        </div>
  
        {(
          (tempState === 'dismissed' &&
            ['DEPENDABOT', 'CODESCAN'].includes(record.toolType)) ||
          (tempState === 'resolved' &&
            record.toolType === 'SECRETSCAN')
        )&&(
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontWeight: 500 }}>
                Dismiss Reason:
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select reason"
                value={dismissReason}
                onChange={setDismissReason}
              >
                {dismissReasons.map((r) => (
                  <Option key={r.value} value={r.value}>
                    {r.label}
                  </Option>
                ))}
              </Select>
            </div>
          )}
  
        <Button
          type="primary"
          onClick={onSave}
          disabled={
            tempState === 'dismissed' &&
            ['DEPENDABOT', 'CODESCAN'].includes(record.toolType) &&
            !dismissReason
          }
        >
          Save
        </Button>
      </div>
    );
  
    const statusColor = statusColorMap[record.status] || 'default';
    return canUpdateState ? (
        <Popover
          content={content}
          title={`Update Status: ${record.title}`}
          trigger="click"
          open={visible}
          onOpenChange={setVisible}
        >
          <Tag color={statusColor} style={{ cursor: 'pointer' }}>
            {record.status}
          </Tag>
        </Popover>
      ) : (
        <Tag color={statusColor}>
          {record.status}
        </Tag>
      );
  };

  export default StatusPopover;