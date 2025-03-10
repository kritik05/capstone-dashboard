import React, { useState, useEffect,useContext } from 'react';
import { Layout, message,Button } from 'antd';
import Fetching from '../components/fetching';
import SideBar from '../components/SideBar';
import FilterBar from '../components/FilterBar';
import FindingTable from '../components/FindingTable';
import { UserContext } from '../UserContext';
const { Header, Content } = Layout;
import TenantSelector from '../components/TenantSelector';
import { LogoutOutlined } from '@ant-design/icons';

export default function Findings(){
    const [toolType, setToolType] = useState([]);
    const [severity, setSeverity] = useState([]);
    const [status, setStatus] = useState([]);
    const [findingId,setFindingId]=useState(null);
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const PAGE_SIZE = 11;
  
    const { user,selectedTenantId ,logout} = useContext(UserContext);

    const currentRole = user?.roleForTenant;
    const isAdmin = currentRole === 'ADMIN';
    const isSuperAdmin = currentRole === 'SUPER_ADMIN';
    const canScan = isAdmin || isSuperAdmin;
    const canDeleteAll = isSuperAdmin;
    const canUpdateState = isSuperAdmin;

    const fetchFindingsPaged = async (page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (toolType.length > 0) {
          toolType.forEach(tt => params.append('toolType', tt));
        }
        if (severity.length > 0) {
          severity.forEach(sv => params.append('severity', sv));
        }
        if (status.length > 0) {
          status.forEach(st => params.append('status', st));
        }
  
        params.append('page', page);
        params.append('size', PAGE_SIZE);  
        params.append('tenantId', selectedTenantId);

        const response = await fetch(`http://localhost:8083/api/findings/search?${params.toString()}`,{
             credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch findings (server-side pagination)');
        }
        const data = await response.json();
        // console.log(data)
        setFindings(data.content ?? []);
        setTotal(data.totalElements ?? 0);
  
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
  
  
    const updateAlertState = async (uuid,alertNumber, newState, dismissedReason,tooltype) => {
        if (!canUpdateState) {
            message.error('You do not have permission to update alert state.');
            return;
          }
      try {
        const body = {
          state: newState,
          dismissedReason: dismissedReason || null,
        };
        const resp = await fetch(`http://localhost:8083/api/findings/${uuid}/${tooltype}/alerts/${alertNumber}/state?tenantId=${selectedTenantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials:"include"
        });
        if (!resp.ok) {
          throw new Error('Failed to update alert state');
        }
        fetchFindingsPaged(currentPage);
        message.success('Alert state updated request sent successfully!');
      } catch (err) {
        message.error(err.message);
      }
    };
  
    const withTenantId = (baseUrl) => {
      return `${baseUrl}?tenantId=${selectedTenantId}`;
    };

    const handleScanEvent = async (selectedTool) => {
      if (!canScan) {
        message.error('You do not have permission to scan.');
        return;
      }
      setLoading(true);
      
      let toolsToScan = [];
        if (selectedTool === 'ALL') {
          toolsToScan = ['CODESCAN', 'DEPENDABOT', 'SECRETSCAN'];
        } else {
          toolsToScan = [selectedTool];
        }
      
      try {

        const scanCalls = toolsToScan.map(async (tool) => {
          const payload = {
            tenantId: selectedTenantId,
            types: tool,
          };
          const response = await fetch(withTenantId('http://localhost:8083/api/scan'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to update scan for tool: ' + tool);
          }
          return response;
        });
        
        // Wait for all individual calls to finish
        await Promise.all(scanCalls);
        message.success('Scan request(s) sent successfully!');
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    
  
    const handleDeleteAll = async () => {
        if (!canDeleteAll) {
            message.error('You do not have permission to delete all findings.');
            return;
          }
      const confirmDelete = window.confirm('Are you sure you want to delete all findings?');
      if (!confirmDelete) return;
  
      setLoading(true);
      try {
        const response = await fetch(withTenantId('http://localhost:8083/api/findings'), {
          method: 'DELETE',
          credentials:'include'
        });
        if (!response.ok) {
          throw new Error('Failed to delete all findings');
        }
        message.success('All findings deleted successfully!');
        setFindings([]);
        setTotal(0);
        setCurrentPage(1);
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleSearchClick = () => {
      setCurrentPage(1);
      fetchFindingsPaged(1);
    };
  
    const handleTableChange = (pagination) => {
      const newPage = pagination.current || 1;
      setCurrentPage(newPage);
      fetchFindingsPaged(newPage);
    };
 

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingTools = params.getAll('toolType'); 
    if (incomingTools.length > 0) {
      setToolType(incomingTools);
    }
    const incomingSev = params.getAll('severity');
    if (incomingSev.length > 0) {
      setSeverity(incomingSev);
    }
    const incomingStat = params.getAll('status');
    if (incomingStat.length > 0) {
      setStatus(incomingStat);
    }
    const findingI = params.get('findingId');
    if(findingI){
      setFindingId(findingI);
    }
    }, []);

    useEffect(() => {
        const newParams = new URLSearchParams();
    
        if (toolType.length > 0) {
          toolType.forEach((t) => newParams.append('toolType', t));
        }
        if (severity.length > 0) {
          severity.forEach((sv) => newParams.append('severity', sv));
        }
        if (status.length > 0) {
          status.forEach((st) => newParams.append('status', st));
        }
    
        newParams.set('page', currentPage);
        newParams.set('size', PAGE_SIZE);
        
        if (selectedTenantId) {
          newParams.set('tenantId', selectedTenantId);
        }

        if (findingId) {
          newParams.set('findingId', findingId);
        }

        window.history.replaceState({}, '', '?' + newParams.toString());
        fetchFindingsPaged(currentPage);
      }, [toolType, severity, status, currentPage, selectedTenantId,findingId]);
    
    return(
        <Layout style={{ minHeight: '100vh' }}>
      <SideBar />
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '30 60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>Findings</h2>
          <Button  type="default"
            icon={<LogoutOutlined />}
            onClick={logout}>Logout</Button> 
              </Header>
              <Content style={{ margin: '16px' }}>
          {/* <TenantSelector/> */}
          <div
            style={{
              background: '#fff',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TenantSelector />
          <Fetching
          onScan={handleScanEvent}
          onDeleteAll={handleDeleteAll}
          loading={loading}
          canScan={canScan}
          canDeleteAll={canDeleteAll}
        />
          </div>
          </div>
        {/* </Header> */}

        {/* <Content style={{ margin: '16px' }}> */}
          <FilterBar
            toolType={toolType}
            setToolType={setToolType}
            status={status}
            setStatus={setStatus}
            severity={severity}
            setSeverity={setSeverity}
            onSearch={handleSearchClick}
            
          />
        
          <FindingTable
            findings={findings}
            loading={loading}
            currentPage={currentPage}
            total={total}
            onTableChange={handleTableChange}
            updateAlertState={updateAlertState}
            canUpdateState={canUpdateState}
            findingId={findingId}              // pass current param
            setFindingId={setFindingId} 
            
          />
        </Content>
      </Layout>
    </Layout>
    )
}