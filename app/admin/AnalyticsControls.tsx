"use client";
import {useState} from 'react';
export default function AnalyticsControls(){
 const [message,setMessage]=useState('Opening this admin page automatically excludes this browser from analytics.');
 function exclude(){try{localStorage.setItem('sac_analytics_excluded','1');setMessage('This browser is excluded. Public visits, votes, submissions and demo clicks from it will not be sent to PostHog.')}catch{setMessage('This browser blocks storage. Use ?analytics_test=1 on every page you test.')}}
 return <section className="review-card"><h2>Participation analytics</h2><p role="status">{message}</p><button onClick={exclude}>Exclude this browser from tracking</button><p>Use <code>?analytics_test=1</code> when testing on another browser or device. This does not change votes or submissions; it only excludes analytics. Browser exclusions apply separately on each domain and are lost if browser storage is cleared.</p></section>
}
