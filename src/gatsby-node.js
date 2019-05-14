const axios = require('axios')
const oauthSignature = require('oauth-signature')

const isObjEmpty = require('./utils/isObjEmpty.js')
const new0AuthParameters = require('./utils/0AuthParameters.js')

let activeEnv =
    process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development'

// If we are in dev, ignore the fact that we are using a fake SSL certificate
if (activeEnv == 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

exports.sourceNodes = async (
    { actions: { createNode }, createNodeId },
    { plugins, baseUrl, api, basicAuth }
) => {
    // Set all routes before we start
    const routes = {
        wp: '/wp-json',
        gf: '/gf/v2',
        forms: '/forms',
    }

    // Helper function to process forms to match with node structure
    const processForm = form => {
        const nodeId = createNodeId(`gravity-form-${form.id}`)
    }

    // These parameters are for all GF calls
    const consumerSecret = api.secret

    const allFormsParams = new0AuthParameters(api.key)

    // Lets get all form details
    const allFormsEncodedSignature = oauthSignature.generate(
        'GET',
        baseUrl + routes.wp + routes.gf + routes.forms,
        allFormsParams,
        consumerSecret
    )

    // Make the call, get all form details
    axios
        .get(baseUrl + routes.wp + routes.gf + routes.forms, {
            params: {
                ...allFormsParams,
                oauth_signature: allFormsEncodedSignature,
            },
        })
        .then(function(response) {
            const allForms = response.data

            // If there are forms to show, lets go!
            if (!isObjEmpty(allForms)) {
                Object.keys(allForms).forEach(function(key) {
                    // Lets get the details for each form
                    let currentFormID = allForms[key].id

                    // Make a new parameters
                    let currentFormParams = new0AuthParameters(api.key)

                    // Make a new signature
                    const currentFormEncodedSignature = oauthSignature.generate(
                        'GET',
                        baseUrl +
                            routes.wp +
                            routes.gf +
                            routes.forms +
                            '/' +
                            currentFormID,
                        currentFormParams,
                        consumerSecret
                    )

                    axios
                        .get(
                            baseUrl +
                                routes.wp +
                                routes.gf +
                                routes.forms +
                                '/' +
                                currentFormID,
                            {
                                params: {
                                    ...currentFormParams,
                                    oauth_signature: currentFormEncodedSignature,
                                },
                            }
                        )
                        .then(function(response) {
                            console.log(response.data)
                        })
                        .catch(function(error) {
                            console.log(error)
                        })
                })
            } else {
                console.log('No forms seem to be made yet?')
            }
        })
        .catch(function(error) {
            console.log(error)
        })
}
