import React, { useEffect, useState } from 'react';
import {
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  PoweroffOutlined,
  BellOutlined,
    SmileOutlined,
  KeyOutlined,
  UploadOutlined,
ClockCircleOutlined
} from '@ant-design/icons';
import "../styles.css";
import { useMatch, useNavigate, useLocation, Outlet } from "react-router-dom";
import {Team} from "../models/Team";
import { Menu, Image, theme, type MenuProps, Layout, Button, message, Badge, Popover, List, Divider, Result } from 'antd';
import UserService from '../services/UserService';
import { NoticeType } from 'antd/es/message/interface';
import useAuth from '../utils/useAuth';
import useAxiosPrivate from '../utils/useAxiosPrivate';
import NotificationService from '../services/NotificationService';
import { Notification } from '../models/Notification';
import dayjs from 'dayjs';


var teams: Team[] = [];

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const LayoutComponent = () => {
    
const matchInterns = useMatch("/interns");
const matchAddIntern = useMatch("/add-intern");
const matchAddPage = useMatch("/add");
const matchInternApplications = useMatch("/intern-applications");
const matchChangePassword = useMatch("/change-password");
const matchMyProfile = useMatch("/profile");
const matchDocumentRequest = useMatch("/document-request");
const matchUploadDocument = useMatch("/upload-document");
//add for other new links

const [seletctedKey, setSelectedKey] = useState("/");
const [items, setItems] = useState<MenuItem []>();
const location = useLocation();
const {auth, setAuth}: any = useAuth();
const [notifications, setNotifications] = useState<Notification []>();
const axiosPrivate = useAxiosPrivate();
const navigate = useNavigate();

    const title = "Intern Management System";
    const footer = "IMS ©2026"


const getData = async () => {
  try {
    const notificationsData: Notification [] = await NotificationService.getNotifications(axiosPrivate, auth.user_id);
    processNotifications(notificationsData);
  } catch (error:any) {
          console.log(error);
if (!error?.response) {
      giveMessage("error", "No server response");
    }
            else {
      giveMessage("error", "Error while fetchind data");
    }
  }
}

useEffect(() => {
  getData()
  },[auth])


const processNotifications = (notificationsData: Notification []) => {

  //Handle day for ending internship notifications
  notificationsData?.map(notification => {
    if(notification.type_code === 2) {

      const endingDay = dayjs(notification.timestamp! * 1000);
      const today = dayjs().startOf("day");

      let dayText = "";
        if (endingDay.isSame(today, "day")) {
          dayText = "today";
        } else if (endingDay.isSame(today.add(1, "day"), "day")) {
          dayText = "tomorrow";
        } else {
          dayText = endingDay.format("dddd");
        }
      notification.content = notification.content + dayText;
    }
  })
  
  setNotifications(notificationsData);
}


const getSelectedkey = () => {
  if(matchInterns){
    setSelectedKey("/interns");
  }
  else if (matchAddIntern) {
    setSelectedKey("/add-intern");
  }
  else if (matchAddPage) {
    setSelectedKey("/add");
  } else if (matchChangePassword) {
    setSelectedKey("/change-password");
  }
  else if (matchInternApplications) {
    setSelectedKey("/intern-applications");
  } 
  else if (matchMyProfile) {
    setSelectedKey("/profile");
  } 
  else if (matchDocumentRequest) {
    setSelectedKey("/document-request");
  }
  else if (matchUploadDocument) {
    setSelectedKey("/upload-document");
  }
  else {
    setSelectedKey("/");
  }
};

//This renders the menu selected item, when the path changes
useEffect(() => {
  getSelectedkey();
}, [location.pathname]);


  //In the side bar, we have a menu. Those are the navigate items
  const adminItems: MenuItem[] = [
    getItem('Home', '/', <HomeOutlined />),
    getItem('Interns', '/interns', <TeamOutlined />),
    getItem('Intern Applications', '/intern-applications', <TeamOutlined />),
    getItem('Tools', 'sub1', <SettingOutlined />, [
      getItem("Add User/Team", "/add"),
      getItem("Add Intern", "/add-intern"),
      getItem("Change Password", "/change-password"),
      getItem("Document Request", "/document-request"),
    ]),
  ];

  const supervisorItems: MenuItem[] = [
    getItem('Interns', '/interns', <TeamOutlined />),
    getItem('Change Password', '/change-password', <KeyOutlined />),
  ];

  const internItems: MenuItem[] = [
    getItem('My Profile', '/profile', <HomeOutlined />),
    getItem('Upload Document', '/upload-document', <UploadOutlined />),
    getItem('Change Password', '/change-password', <KeyOutlined />),
  ];


  useEffect(() => {
    if(auth) {
      if(auth.role === 5150) {
        setItems(adminItems);
      }
      else if(auth.role === 1984) {
        setItems(supervisorItems);
      }
      else {
        setItems(internItems);
      }
    }
  }, [auth])


  
  const logout = async () => {
    await UserService.logout();
  }

  const onClick = () => {
    logout();

    giveMessage("success", "Log out successfull");
    navigate("/login");
  }

  const giveMessage = (type: NoticeType, mssge: string) => {
    message.open({
      type: type,
      content: mssge,
    });
  };

  const handleSeen = async () => {
    try {
      await NotificationService.handleSeen(axiosPrivate, auth.user_id);
      
      setNotifications(prevNotifications => {
        return prevNotifications?.map(notification => {
            return { ...notification, is_seen: true };
        });
    });
          } catch (error) {
        console.log(error);
    }
  }

  const addAccessToken = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}access_token=${auth.accessToken}`;
}

  const handlePopoverVisibleChange = (visible: boolean) => {
    if (!visible) {
      handleSeen();
    }
  }

  function formatRelativeTime(timestamp: number) {
    
    const currentDate = dayjs();
    const inputDate = dayjs(timestamp * 1000);
  
    const diffInSeconds = currentDate.diff(inputDate, 'second');
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } 
        else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } 
        else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } 
        else {
      const diffInDays = Math.floor(diffInSeconds / 86400);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  }

  return (
      <>

      <Layout style={{ minHeight: '98vh' }}>
        <Sider style={{ height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 999 }}>

          <div className="logo-area" style={{marginLeft: "25px"}}>
            <Image width={150} height={150} style={{}} preview={false}
            src={"/uploads/photos/issd_logo.png"} />  
          </div>1
          
          <Menu theme="dark" defaultSelectedKeys={['/']} mode="inline" items={items} selectedKeys={[seletctedKey]}  onClick={({key}) => {
              navigate(key);
          }}></Menu>


          

          <div className='logout-area' style={{backgroundColor:"#163851", height: "50px", position: "absolute", bottom: "0%", width: "200px", zIndex: 99, display: "inline-block"}}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "5px" }}>
              <span style={{fontSize: "20px", fontWeight: "initial", color: "white", marginLeft: "5px"}}>{auth.username}</span>
              <Button
                type="primary"
                icon={<PoweroffOutlined />}
                style={{marginLeft: "30px"}}
                size='large'
                onClick={onClick}
                danger
                ghost
                />
            </div>
          </div>

        </Sider>

        <Layout style={{marginLeft: 200, marginTop: 0,}}>
          
          <header className='header'>
            <h1 className='header-title' style={{marginLeft: "20px"}}>{title}</h1>

            <div className='notifications'>

            <Popover placement="bottomRight" content={
              <>
                <Divider orientation='center'>Notifications</Divider>

                {notifications?.length !== 0 && <List
                style={{width: "600px", borderRadius: "20px"}}
                itemLayout="horizontal"
                dataSource={notifications?.map(notification => notification)}
                renderItem={(item) => {
                  let background = item.is_seen ? "white" : "#c6e2ff"
                  return (
                    <div style={{height: "35px", background: background, paddingTop: "20px", paddingLeft: "10px", marginBottom: "2px"}}>
                      <span>{item.content}</span> <span style={{color: "gray", paddingRight: "10px", float: "right"}}><ClockCircleOutlined />{" "}{formatRelativeTime(item.notification_date)}</span>
                    </div>
                    
                  )  
                }
                }
               />}

               {notifications?.length === 0 && 
                <Result
                icon={<SmileOutlined />}
                title="You don't have any notifications"
              />
               }


            
              </>
            } trigger="click" onVisibleChange={handlePopoverVisibleChange}>

              <div style={{position: "absolute", right: "50px", top: "50px"}}>
              <Badge size='small' offset={[-5,10]} count={notifications?.filter(notification => notification.is_seen === false).length}>
                <Button
                  icon={<BellOutlined />}
                  size='large'
                  ghost
                  style={{border: "none"}}
                 
                  />
              </Badge>
              </div>
            
            </Popover>
               
                            </div>
          </header>


          <Content className='content'>
            <Outlet />
          </Content>


          <Footer style={{ textAlign: 'center' }}>{footer}</Footer>
        </Layout>

      </Layout>
            
</>
  );
}

export default LayoutComponent;