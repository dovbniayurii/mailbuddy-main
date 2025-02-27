import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../../lib/firebase/admin";
import { stripe } from "../../../lib/stripe/api";

type ResponseData = {
    errorcode: number,
    message: string,
}


/**
 * Route to create a stripe setupintent to add a credit card to a user account
 * @param req Request object
 * @param res Response object
 */
export default async function handler( req: NextApiRequest, res: NextApiResponse<ResponseData> ) {
  if( req.cookies.token ){
    const token = await auth.verifyIdToken( req.cookies.token );

    if( req.method == "POST" ){
      if( token ){
        const data = req.body;

        // Checkt that the caller provided the id of a customer
        if( data.customer != undefined ){
          try {
            // Create the setupintent with the provided customer id
            const setupintent = await stripe.setupIntents.create({
              automatic_payment_methods: {
                enabled: true
              },
              customer: data.customer
            });

            // Return the client secret of the setupintent
            return res.status( 200 ).send( { errorcode: 0, message: setupintent.client_secret } );
          } catch (error) {
            console.log(error);
            return res.status( 400 ).send( { errorcode: 4, message: "Something went wrong" } );
          }
        }else{
          return res.status( 400 ).send( { errorcode: 3, message: "Data required!" } );
        }

      }else{
        return res.status( 400 ).send( { errorcode: 2, message: "Authentication required!" } );
      }
    }else{
      return res.status( 400 ).send( { errorcode: 1, message: "The request method is forbidden!" } );
    }
  }
}
