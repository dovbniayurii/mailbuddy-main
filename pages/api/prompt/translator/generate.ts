import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../../../lib/firebase/admin"
import { AIMessage, AssistantResponse, generateAIResponse, Model } from "../../../../lib/helper/prompt/generation";


/**
 * Translator assistant route.
 * @param req Request object
 * @param res Response object
 */
export default async function handler( req: NextApiRequest, res: NextApiResponse<AssistantResponse | string> ) {
  const token = await auth.verifyIdToken( req.cookies.token );

  if( req.method == "POST" ){
    if( token ){
      const data = req.body;

      // Validate that the user provided a prompt
      if( data.prompt != undefined ){
        try{
          // Create the messages to send to the AI model
          const messages: Array<AIMessage>  = [
            {
              role: "system",
              content: "Du bist ein Agent und übersetzt Texte in eine Zielsprache die durch den Nutzer spezifiziert wird."+
                  "Die Antwort sollte den Inhalt des Originaltextes erhalten und so genau wie möglich übersetzen."+
                  "Daten, Fakten und Zahlen sollten immer unverändert wiedergegeben werden. Gib nur den übersetzen Text aus"
            },
            {
              role: "user",
              content: data.prompt
            }];

          // Call the model and get the used tokens back.
          const { count } = await generateAIResponse(Model.GPT4, messages, res, data)

          // Send a response with token counts
          return res.status(200).send(`<~${count.response + count.request}~>`);
        }catch( E ){
          console.log(E);
          return res.status( 400 ).send( { errorcode: -2, message: "Error generating answer", tokens: -1 } );
        }
      }else{
        return res.status( 400 ).send( { errorcode: 3, message: "Missing Input!", tokens: -1 } );
      }
    }else{
      return res.status( 400 ).send( { errorcode: 2, message: "Authentication required!", tokens: -1 } );
    }
  }else{
    return res.status( 400 ).send( { errorcode: 1, message: "The request method is forbidden!", tokens: -1 } );
  }
}
