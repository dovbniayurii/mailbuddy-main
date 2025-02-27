import router from "next/router";
import { useState, useEffect } from "react";
import { Alert, Checkbox, Form, Input, Menu, MenuProps, Row, Col, Layout } from "antd";
import styles from "./login.module.scss"
import signIn from "../../lib/firebase/auth/signin";
import Head from "next/head";
import Link from "next/link";
import CookieBanner from "../../lib/components/CookieBanner/CookieBanner";
import FatButton from "../../lib/components/FatButton";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../db";
import getDocument from "../../lib/firebase/data/getData";
import { User } from "../../lib/firebase/types/User";

const { Content, Footer } = Layout;

const TypewriterEffect = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (index >= texts.length) return;

    if (subIndex === texts[index].length + 1 && !reverse) {
      // Wait after showing the text until it was deleted entirely
      setTimeout(() => setReverse(true), 3000); // wait 3 seconds bevor deleting the text
      return;
    }

    if (subIndex === 0 && reverse) {
      // Reset the subindex to delete the text
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const typingSpeed = 35; // Geschwindigkeit des Schreibens
    const timeout = setTimeout(() => {
      setSubIndex((prev) => reverse ? 0 : prev + 1);
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts]);

  useEffect(() => {
    const blinkSpeed = 500; // Speed of the blinking animation
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, blinkSpeed);

    return () => clearTimeout(timeout2);
  }, [blink]);

  return <span>{`${texts[index].substring(0, subIndex)}${blink ? "|" : " "}`}</span>;
};


/**
 * Define the login page navigation
 */
const frontendnav: MenuProps["items"] = [
  {
    label: <Link href={"privacy"}>Datenschutz</Link>,
    key: "privacy"
  },
  {
    label: <Link href={"legal"}>Impressum</Link>,
    key: "legal"
  }
]

/**
 * Page users can use to log in into the application
 * @constructor
 */
export default function Login(){
  // State to indicate login failures
  const [ loginFailed, setLoginFailed ] = useState( false );

  /**
   * Function to call on form finish -> form send
   * @param values Input values
   */
  const onFinish = async ( values ) => {
    // Call the firebase sign in routine
    const { result, error } = await signIn( values.email, values.password );

    // Check if we ecounter a sign in error
    if ( error ) {
      setLoginFailed( true );
    }else{
      setLoginFailed( false );
      //console.log(result)
      logEvent(analytics, "login", {
        email: values.email
      });

      // If the login was successfull query the database for the resulting user id
      const usereq = await getDocument("User", result.user?.uid);

      // Check if the query request was successfull
      if(usereq.result){
        // Cast the query result as User object
        const userobj = usereq.result.data() as User;

        if(userobj){
          /*// Choose where to redirect the user to after the login
          if(userobj.setupDone){

          }else{
            return router.push( "/setup" )
          }*/

          return router.push( "/" )
        }else{
          return router.push( "/login" )
        }
      }else{
        // If we encounter an error set the failed flga
        setLoginFailed( true );
      }
    }
  };

  /**
   * Function to resolve form send errors
   */
  const onFinishFailed = () => {
    //console.log('Failed:', errorInfo);
    setLoginFailed( true );
  };

  return (


    <Layout className={styles.backgroundStyle}>
      <div className={styles.overlayStyle}></div>
      <div className={styles.overlay}></div>
      <Content className={styles.contentContainer}>
        <Row justify="space-around" align="bottom" style={{ height: "100%" , padding: "5% 0" }}>
          <Col xs={8}  // Fullwidth on very small screens
            sm={8}  // Wider screens, but still smaller than tablets
            md={12}  // Tablet
            lg={8}  // Small Desktops
            xl={4}   // Big Desktops
            style={{ textAlign: "right" }}>
            <div className={styles.logobox}>
              <Link href={"/login"}>
                {/*eslint-disable-next-line */}
              <img src={"/siteware-logo-white.svg"} alt="Logo"/>
              </Link>
            </div>
          </Col>
          <Col className={styles.typewriterContainer} xs={24}  // Fullwidth on very small screens
            sm={24}  // Wider screens, but still smaller than tablets
            md={12}  // Tablet
            lg={10}  // Small Desktops
            xl={8}   // Big Desktops
          >
            <div className={styles.typewriterEffect}>
              <
                TypewriterEffect texts = {
                  ["Entdecke deine neue KI aus Deutschland und revolutioniere deine Produktivität.",
                    "Ich biete dir laufend neue KI-Agenten, für alle möglichen Aufgaben.",
                    "Lass mich deine E-Mails schreiben und beantworten – spare Zeit und Mühe!",
                    "Die Einrichtung ist kinderleicht und dauert nur 3 Minuten – starte sofort ohne Kreditkarte.",
                    "Registriere dich kostenlos und erhalte 20,- EUR Startguthaben zum Ausprobieren.",
                    "Mit mir brauchst du keine Fachkenntnisse – ich erledige das für dich!",
                    "Erlebe unübertroffene Ergebnisqualität mit meiner Siteware® Multimodal-Technologie, die gleichzeitig mit mehreren KI-Modellen arbeitet.",
                    "Ich erstelle Texte genau nach deinem Stil und Umfang – du bestimmst die Details.",
                    "Ich arbeite deine Aufgaben effizient und dynamisch in mehreren Schritten mit der Siteware®-DMSP-Technologie ab.",
                    "Ich spare dir viel Zeit und sorge dafür, dass du dich wieder auf deine wesentlichen Aufgaben konzentrieren kannst.",
                    "Ich beantworte alle deine Excel-Fragen wie ein Experte.",
                    "Mit einem Konto bei Siteware erhältst du Zugang zu den fortschrittlichsten KI-Modellen am Markt.",
                    "Ich lerne schnell dazu über dich, dein Unternehmen und deine Angebote, um maßgeschneiderte Lösungen zu bieten (Siteware®-Brain).",
                    "Ich übersetze deine Texte in zahlreiche Sprachen und sorge für korrekte Rechtschreibung.",
                    "Profitiere bald von unserer Community: Entwickle eigene Agenten mit Siteware und erhalte einen Anteil am Umsatz."
                  ]
                }
              />
            </div>
          </Col>
          <Col className={styles.formContainer} xs={24}  // Vollbreite auf sehr kleinen Bildschirmen
            sm={24}  // Fullwidth on very small screens
            md={18}  // Tablet
            lg={10}  // Small Desktops
            xl={8}   // Big Desktops
          >
            <h1 className={styles.formtitle}>Log in</h1>
            <div className={styles.formexplanation}>Willkommen zurück. Bitte gebe unten deine Logindaten ein.</div>
            <Form
              name="basic"
              className={styles.loginform}
              initialValues={{
                remember: true
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              onChange={() => {
                setLoginFailed( false )
              }}
            >
              <Form.Item
                label="E-Mail"
                name="email"
                className={styles.loginpart}
              >
                <Input className={styles.logininput} name="email" />
              </Form.Item>

              <Form.Item
                label="Passwort"
                name="password"
                className={styles.loginpart}
              >
                <Input.Password className={styles.logininput}  name="password"/>
              </Form.Item>

              <div className={styles.rememberrow}>
                <Checkbox name="remember">Eingeloggt bleiben</Checkbox>
                <Link href={"/forgot/password"}>Passwort vergessen</Link>
              </div>

              <Alert
                style={{ marginBottom: 20, marginTop: 20, display: ( loginFailed )? "block": "none" }}
                message="Beim Anmelden ist etwas schief gelaufen bitte versuche es noch einmal!"
                type="error"
              />

              <Form.Item className={styles.loginbutton}>
                <FatButton isSubmitButton={true} text="Anmelden" />
              </Form.Item>
            </Form>

          
                    
            <div className={styles.signupnotice}>
              <div>Noch keinen Account?</div><Link className={styles.signuplink} href={"/register"}>Jetzt kostenlos registrieren</Link>
            </div>
          </Col>
        </Row>
      </Content>
      <Footer className={styles.footerContainer}>
        <Menu className={styles.navmenu} mode="horizontal" items={frontendnav} />

      </Footer>
    </Layout>
  );
}

/**
 * Login page layout seperate from the normal login flow
 * @param page
 */
Login.getLayout = ( page ) => {
  return(
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Siteware | Dein intelligenter KI-Agent" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/ogimage.jpg" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASEURL}`} />
        <link rel="icon" type="image/x-icon" href="small_logo.ico" />
        <title>Siteware | Dein intelligenter KI-Agent</title>
      </Head>
      <main >
        {page}
        <CookieBanner />
      </main>
    </>
  );
}