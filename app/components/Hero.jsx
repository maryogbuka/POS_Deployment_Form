'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {

 const [openAgent, setOpenAgent] = useState(false); 
 const [openMerchant, setOpenMerchant] = useState(false);

  return (
    
    
    <main>
      <section className="flex flex-col items-center px-4 text-center">
        
        {/* Background */}
        <div className="fixed inset-0 -z-10 bg-gray-100"></div>
        {/* Hero section */}
        <h1 className="text-3xl md:text-5xl text-gray-700 font-bold mb-4">
          Every Payment, Made Easy
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
          Power your business with secure and fast POS machines. Whether you
          are running a POS business as an agent or receiving payments as a
          merchant, we make transactions easy anywhere in Nigeria.
        </p>

        
        
        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/agentForms">
            <button onClick={() => setOpenAgent(true)} className="px-6 py-3 border border-[#0B3D3B] bg-[#d7d9d2] text-black rounded-xl hover:bg-green-700 hover:text-blue-50 transition">
              Apply as Agent
            </button>
          </Link>

          <Link href="/merchantForms">
            <button onClick={() => setOpenMerchant(true)} className="px-6 py-3   bg-[#0B3D3B] text-[#d7d8d4] rounded-xl hover:bg-green-700 transition">
              Apply as Merchant
            </button>
          </Link>
        </div>

        
        
        {/* Why Choose Us Section */}
        <section className="pt-16">
          <h2 className="text-2xl md:text-4xl text-gray-700 font-bold text-center mb-10">
            Why Choose Our POS?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            We provide reliable and efficient POS solutions that empower your
            business with fast settlements, 24/7 support, and nationwide
            coverage.
          </p>

          
          {/* Features */}
          <div className="grid md:grid-cols-3 text-gray-700 gap-8 max-w-6xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <Image src="/androidPoS.png" 
              alt="Fast Settlement" 
              width={80} 
              height={80} 
              className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Fast Settlements</h3>
              <p>Receive your money instantly into your account after every transaction.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Image src="/support.png" 
              alt="Support" 
              width={80} 
              height={80} 
              className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p>Our team is always available to assist you, anytime, anywhere.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Image src="/trust.png" 
              alt="Nationwide" 
              width={80} 
              height={80} 
              className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Trusted Nationwide</h3>
              <p>Thousands of agents and merchants across Nigeria rely on our POS daily.</p>
            </div>
          
          </div>
        </section>

        
        
        {/* Who Can Apply Section */}
        <section className="pt-16">
          <h2 className="text-2xl md:text-4xl text-gray-700 font-bold text-center mb-10">
            Who Can Apply?
          </h2>
          <div className="grid md:grid-cols-2 text-gray-700 gap-8 max-w-6xl mx-auto">
            
            
            {/* Agent */}
            <div className="bg-white p-6 rounded-2xl text-center shadow-lg">
              
              <Image src="/agent.png" 
              alt="POS Agent" 
              width={300} 
              height={200} 
              className="mx-auto mb-4 rounded-lg"
              />

              <h3 className="text-xl font-semibold mb-2">POS Agent</h3>
              <p>
                Start your POS business and earn income by helping people withdraw,
                deposit and transfer money in your community.
              </p>
            </div>

            {/* Merchant */}
            <div className="bg-white p-6 rounded-2xl text-center shadow-lg">
              <Image src="/merchant.png" 
              alt="POS Merchant" 
              width={300} 
              height={200} 
              className="mx-auto mb-4 rounded-lg"
              />
              <h3 className="text-xl font-semibold mb-2">Merchant</h3>
              <p>
                Accept payments easily from your customers using our secure POS
                devices. Perfect for shops, supermarkets, and businesses.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
