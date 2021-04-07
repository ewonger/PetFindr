import React, { useState, useEffect } from 'react';

import api from '../api.js'

// AWS SDK
import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

// Bootstrap
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

// Map
import Marker from '../components/Marker';
import GoogleMapReact from 'google-map-react';

export default function Create() {
  const [petName, setPetName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postingType, setPostingType] = useState("");

  // Coordinates
  const [latitude, setLat] = useState(49);
  const [longitude, setLong] = useState(-123);

  const [imageURL, setImageURL] = useState("");
  const [imgFile, setImgFile] = useState(null);
  let imgKey = "";

  const [btnIsDisabled, setBtnState] = useState(false);

  function previewImage(event){
    let r = new FileReader();
    r.onload = function(){
      setImageURL(r.result);
    }
    r.readAsDataURL(event.target.files[0]);
  }

  async function postDetails(){
    let postObj = {
      'contactEmail': email,
      'contactPhone': phone,
      'city': city,
      'description': description,
      'postingType': postingType,
      'dateLostFound': Date.now(),
      'coordinates': [latitude, longitude],
      'petName': petName,
      'animalType': animalType,
      'imgKey': imgKey
    }

    console.log(postObj);
    setBtnState(true);
    
    await fetch(api.gateway, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(postObj) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })

    // else{
    //   alert("Form is incomplete");
    // }
  }

  async function postImage(){
    if(imgFile){
      try {
        const albumPhotosKey = encodeURIComponent("album1") + "/";
        const data = await s3.send(
            new ListObjectsCommand({
              Prefix: albumPhotosKey,
              Bucket: api.albumBucketName
            })
        );

        const file = imgFile;
        const fileName = file.name + "-" + Date.now();
        const photoKey = albumPhotosKey + fileName;
        const uploadParams = {
          Bucket: api.albumBucketName,
          Key: photoKey,
          Body: file
        };
        try {
          const data = await s3.send(new PutObjectCommand(uploadParams));
          imgKey = photoKey;
          alert("Successfully uploaded photo.");
        } catch (err) {
          alert("There was an error uploading your photo: ", err.message);
        }
      } 
      catch (err) {
        console.log("error:", err);
      }
    }
    else{
      alert("Choose a file to upload first.");
    }
  }

  /*
  async function getAllAlbumNames(){
    try{
      const data = await s3.send(
        new ListObjectsCommand({ Delimiter: "/", Bucket: api.albumBucketName })
      );
      var albums = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", ""));

        console.log(albums);
        console.log(prefix);
        console.log(albumName);
      })
    }
    catch(err){
      console.log(err);
    }
  }
  */

  const s3 = new S3Client({ 
    region: api.bucketRegion,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: api.bucketRegion }),
      identityPoolId: api.IdentityPoolId
    })
  });

  return (
    <Container>
        <h1 className="display-4">Post Details</h1>
        <Col>
          <Form>
            <Form.Group>
              <Form.Label>Pet Name</Form.Label>
              <Form.Control type="text" placeholder="asdf" onChange={(e) => setPetName(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Animal Type</Form.Label>
              <Form.Control as="select" onChange={(e) => setAnimalType(e.target.value)}>
                <option>Cat</option>
                <option>Dog</option>
                <option>Bird</option>
                <option>Reptile</option>
                <option>Cow</option>
                <option>Other</option>
              </Form.Control>
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" placeholder="Big red dog" onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>City</Form.Label>
              <Form.Control as="select" onChange={(e) => setCity(e.target.value)}>
                <option>Vancouver</option>
                <option>North Vancouver</option>
                <option>Burnaby</option>
                <option>Surrey</option>
                <option>Richmond</option>
                <option>New Westminster</option>
                <option>Coquitlam</option>
                <option>Delta</option>
                <option>Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="text" placeholder="example@petfindr.com" onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" placeholder="asdf" onChange={(e) => setPhone(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Posting Type</Form.Label>
              <Form.Control as="select" onChange={(e) => setPostingType(e.target.value)}>
                <option>Lost</option>
                <option>Found</option>
              </Form.Control>
            </Form.Group>

            <img style={{"width": "300px", "height": "300px"}} src={imageURL}/>

            <Form.Group>
              <Form.File 
                label="Upload an image" 
                onChange={(e) => {
                    console.log(e.target.files[0]);
                    previewImage(e);
                    setImgFile(e.target.files[0]);
                  }
                }
              />
            </Form.Group>
          </Form>
        </Col>

        <Col>
          <Row>
            <h1 className="display-4 my-4">Map</h1>
            <div style={{ height: '60vh', width: '100%' }}>
              <GoogleMapReact
                bootstrapURLKeys={{key: "AIzaSyBvegNY-5thSCCntrobyjDyHkqWsKteQVc"}}
                defaultCenter={{lat: 49, lng: -123}}
                zoom={9}
                onClick={ ({x, y, lat, lng}) => {
                  // console.log("x:" + x, "y:" + y, "latitude:" + lat, "long:" + lng);
                  setLat(lat);
                  setLong(lng);
                  console.log("lat:", latitude, "lng:", longitude);
                }}  
              >
                <Marker lat={latitude} lng={longitude} text="1"/>
              </GoogleMapReact>
            </div>
          </Row>
        </Col>
        
        <Button disabled={btnIsDisabled} onClick={async() => {
            await postImage();
            await postDetails();
          }}
        >
          Submit
        </Button>

    </Container>
  );
}