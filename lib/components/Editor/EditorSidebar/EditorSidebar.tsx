import React, { Dispatch, ReactNode, useEffect, useState } from "react";
import { ArrowLeftOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, Layout, message, Switch } from "antd";
import Link from "next/link";
import styles from "./editorsidebar.module.scss";
import CookieBanner from "../../CookieBanner/CookieBanner";
import Assistant, { Block, FileReference, InputBlock, Visibility } from "../../../../lib/firebase/types/Assistant";
import updateData from "../../../../lib/firebase/data/updateData";
import { checkValidityOfAssistantConfig } from "../../../../lib/helper/assistant";
import GeneralSettingsModal from "../GeneralSettingsModal/GeneralSettingsModal";

const { Header, Content, Sider } = Layout;


export interface editorctx{
  assistant: Assistant;
  setAssistant: Dispatch<any>;
}

export interface AssistantState {
  name: string,
  image: string,
  category: string,
  description: string,
  video: string,
  published: boolean,
  uid: string,
  blocks: Array<Block | InputBlock>,
  owner: string,
  visibility: Visibility,
  selectedCompanies?: Array<string>,
  knowledgeFiles: Array<FileReference>
}

export const EditorSidebarContext = React.createContext<editorctx>( {} as editorctx );

export const useEditorContext = () => React.useContext( EditorSidebarContext );


/**
 * Provides a layout with a sidebar. The sidebar implements a simple navigation
 * @param props.children Page content
 * @param props.context.user User object of the application
 * @param props.context.login Firebase login object
 * @param props.context.role Role object of the current user
 * @param props.context.profile Profilepicture information
 * @param props.hist Dispatcher used to display the history if we render the mobile header
 * @returns SidebarLayout component
 */
const EditorSidebar = ( props: {
  assistant: Assistant,
  aid: string,
  children: ReactNode,
} ) => {
  const [collapsed, setCollapsed] = useState( false );
  // eslint-disable-next-line
    const [ collapseWidth, setCollapseWidth ] = useState( 80 );
  // eslint-disable-next-line
    const [ breakpoint, setBreakpoint ] = useState( undefined );
  // eslint-disable-next-line
    const [ imageUrl, setImageUrl ] = useState( undefined );
  // eslint-disable-next-line
    const [ version, setVersion ] = useState( "" );

  const [ sidebaropen, setSidebarOpen ] = useState(false);

  const [ screenwidth, setScreenwidth ] = useState(window.innerWidth);

  const [ assistantState, setAssistantState ] = useState<AssistantState>(props.assistant);

  const [ settingsModalOpen, setSettingsModalOpen ] = useState(false);
  const [ settForm ] = Form.useForm();
  const [messageApi, messageContext] = message.useMessage();
  const [ name, setName ] = useState((props.assistant)? props.assistant.name: "Neuer Assistant");
  const [ confValid, setConfValid ] = useState(false);


  useEffect(() => {
    setAssistantState(props.assistant);
    settForm.setFieldValue("category", props.assistant.category);
    settForm.setFieldValue("description", props.assistant.description);

    console.log(assistantState)
    console.log(props.assistant)
  }, []);
  


  useEffect(() => {
    setConfValid(checkValidityOfAssistantConfig(assistantState.blocks));
  }, [assistantState]);


  /**
     * Effect used for responsive sizing of the sidebar
     */
  useEffect(() => {
    if(screenwidth <= 1500 ){
      setBreakpoint("lg");
      setCollapseWidth(0);
      setCollapsed(true);
    }else{
      setCollapsed(true);
      setBreakpoint(undefined);
      setCollapseWidth(80);
    }
  }, [screenwidth]);


  /**
     * Effect used bind a eventlistener to window resizes,
     * so we can adapt the sidebar size accordingly without a page reload
     */
  useEffect(() => {
    const handleResize = () => {
      setScreenwidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  const saveAssistant = async () => {
    const AssistantToUpdate: Assistant = assistantState;
    const desc = settForm.getFieldValue("description");

    AssistantToUpdate.description = (desc)? desc: "";
    AssistantToUpdate.category = settForm.getFieldValue("category");
    AssistantToUpdate.visibility = (settForm.getFieldValue("visibility"))? settForm.getFieldValue("visibility"): Visibility.PRIVATE;
    const selectedCompsString: string = settForm.getFieldValue("selectedCompanies");
    AssistantToUpdate.selectedCompanies = (selectedCompsString)? selectedCompsString?.split("\n"): [];
    AssistantToUpdate.name = name;
    
    if(AssistantToUpdate.blocks && AssistantToUpdate.blocks.length > 0){
      
    

      if(AssistantToUpdate.name){
        if(AssistantToUpdate.category){
          if(props.aid){
            const updateReq = await updateData("Assistants", props.aid, AssistantToUpdate);

            if(updateReq.error){
              console.log(updateReq.error);
              messageApi.error("Speichern fehlgeschlagen. Bitte versuch es später erneut!");
            }else{
              messageApi.success("Speichern erfolgreich!");
            }
          }else{
            /*const createReq = await addDataWithoutId("Assistants", AssistantToUpdate);

            if(createReq.error){
              console.log(createReq.error);
              messageApi.error("Speichern fehlgeschlagen. Bitte versuch es später erneut!");
            }else{
              messageApi.success("Speichern erfolgreich!");
              router.replace(`/editor?aid=${createReq.result.id}`);
            }*/
          }
        }else{
          setSettingsModalOpen(true);
          messageApi.error("Bitte lege eine Kategorie fest!");
        }
      }else{
        messageApi.error("Bitte gib einen Namen für deinen Agenten ein!");
      }
    }else{
      messageApi.error("Bitte definiere mindestens einen Block!");
    }
  }

  const PreviewButton = () => {
    if( confValid ){
      return <Button target={"_blank"} href={`/assistant?aid=${props.aid}`} className={styles.savebutton}>Vorschau</Button>;
    }else{
      return <Button onClick={() => {
        messageApi.error("Konfiguration fehlerhaft. Bitte überprüfe die Blöcke.")
      }} className={styles.savebutton}>Vorschau</Button>;
    }
  }

  /**
     * Subcomponent to render a header if the screenwidth is below a fixed amount
     * @returns Header component
     */
  const MobileHeader = () => {
    if(screenwidth <= 1500){
      return(
        <Header className={styles.header}>
          <Link className={styles.backbutton} href={"/"}>
            <Button><ArrowLeftOutlined/></Button>
          </Link>
          <Link href={"/"} className={styles.headerlink}>
            {/*eslint-disable-next-line */}
              <img src="/small_logo.png" width={32} height={32} alt="Logo"/>
          </Link>

          <div className={styles.nameinput}>
            <Input value={name} placeholder={"Neuer Agent"}
              onChange={(val) => {
                setName( val.target.value )
              }}></Input>
          </div>

          <div className={styles.assistantSettings}>
            <div className={styles.settingsbutton} onClick={() => setSettingsModalOpen(true)}>
              <SettingOutlined/>
            </div>
          </div>
          <GeneralSettingsModal 
            aid={props.aid} 
            assistantState={assistantState} 
            setAssistantState={setAssistantState} 
            assistant={props.assistant} 
            open={settingsModalOpen}
            setOpen={setSettingsModalOpen}
            messageApi={messageApi} 
            settForm={settForm} 
          />

          <div className={styles.headerActions}>
            <div className={styles.additionalSettings}>
              <span className={styles.settingsname}>Veröffentlicht?</span>
              <Switch value={(assistantState) ? assistantState.published : false} size="small"
                onChange={(val) => setAssistantState({ ...assistantState, published: val })}/>
            </div>
            <div className={styles.editorActions}>
              <PreviewButton />
              <Button onClick={() => {
                saveAssistant();
              }} className={styles.savebutton}
              type={"primary"}>{(props.aid) ? "Speichern" : "Agenten anlegen"}</Button>
            </div>
          </div>
        </Header>
      );
    }
  }
  
  

  // Check the current screenwidth
  if(screenwidth <= 1500){
    // if the screenwidth is below 1500px render the mobile layout of the sidebar
    return (
      <EditorSidebarContext.Provider value={{ assistant: assistantState, setAssistant: setAssistantState }}>
        <Layout className={styles.layout} hasSider={(screenwidth > 1500)}>
          {messageContext}
          <MobileHeader />
          <Drawer
            style={{ backgroundColor: "#101828" }}
            bodyStyle={{ backgroundColor: "#101828", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", width: 80, borderColor: "#101828" }}
            placement="left"
            width={80}
            onClose={() => {
              setSidebarOpen(false)
            }}
            open={sidebaropen}
            closeIcon={null}
          >
            <div className={styles.mobilesidebarcontainer}>
              <div className={styles.logobox}>
                {/*eslint-disable-next-line */}
                  <img src="/small_logo.png" width={41.15} height={40} alt="Logo"/>
              </div>
              <div className={styles.drawermenu}>
              </div>
              <div className={styles.sidebarbottomcontainer}>
                <div className={styles.avatarcontainer}>
                </div>
              </div>
            </div>
          </Drawer>
          <Sider
            width={80}
            className={`${styles.sidebar}`}
            breakpoint={breakpoint}
            collapsedWidth={collapseWidth}
            collapsed={collapsed}
            onCollapse={( value ) => {
              setCollapsed( value )
            }}
          >
            <Link href={"/"}>
              <div className={styles.logobox}>
                {/*eslint-disable-next-line */}
                  <img src="/small_logo.png" width={41.15} height={40} alt="Logo"/>
              </div>
            </Link>

            <div className={styles.navigation}>

              <div className={styles.sidebarbottomcontainer}>
                <div className={styles.avatarcontainer}>
                </div>
              </div>
            </div>
          </Sider>

          <Layout>
            <Content className={styles.layoutcontent}>
              <div className={styles.childrencontainer}>
                {props.children}
              </div>
            </Content>
          </Layout>
          <CookieBanner />
        </Layout>
      </EditorSidebarContext.Provider>
    );
  }else{
    // If the width of the screen is above 1500px we render the desktop variant of the component
    return (
      <EditorSidebarContext.Provider value={{ assistant: assistantState, setAssistant: setAssistantState }}>
        {messageContext}
        <Layout className={styles.layout}>
          <Header className={styles.header}>
            <Link className={styles.backbutton} href={"/"}>
              <Button><ArrowLeftOutlined /></Button>
            </Link>
            <Link href={"/"} className={styles.headerlink}>
              {/*eslint-disable-next-line */}
              <img src="/small_logo.png" width={32} height={32} alt="Logo"/>
            </Link>

            <div className={styles.nameinput}>
              <Input value={name} placeholder={"Neuer Agent"} onChange={(val) => {
                setName(val.target.value )
              }}></Input>
            </div>

            <div className={styles.assistantSettings}>
              <div className={styles.settingsbutton} onClick={() => setSettingsModalOpen(true)}>
                <SettingOutlined />
              </div>
            </div>
            <GeneralSettingsModal
              aid={props.aid}
              assistantState={assistantState}
              setAssistantState={setAssistantState}
              assistant={props.assistant}
              open={settingsModalOpen}
              setOpen={setSettingsModalOpen}
              messageApi={messageApi}
              settForm={settForm}
            />

            <div className={styles.headerActions}>
              <div className={styles.additionalSettings}>
                <span className={styles.settingsname}>Veröffentlicht?</span>
                <Switch
                  value={(assistantState)? assistantState.published: false}
                  size="small"
                  onChange={(val) => setAssistantState({ ...assistantState, published: val })}
                />
              </div>
              <div className={styles.editorActions}>
                <PreviewButton />
                <Button onClick={() => {
                  saveAssistant();
                }} className={styles.savebutton} type={"primary"}>{(props.aid)? "Speichern" : "Agenten anlegen"}</Button>
              </div>
            </div>
          </Header>

          <Layout>
            <Content className={styles.layoutcontent}>
              <div className={styles.childrencontainer}>
                {props.children}
              </div>
            </Content>
          </Layout>
          <CookieBanner />
        </Layout>
        <style>{"html{ overflow-y: hidden !important; }"}</style>
      </EditorSidebarContext.Provider>
      
    );
  }
};
export default EditorSidebar;