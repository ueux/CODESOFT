'use client'

import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from 'apps/user-ui/src/assets/svgs/socialMediaIcons';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathName = usePathname()
  if(pathName==='/inbox') return null
  return (
    <footer className="bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 ">


        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                  {/* My Account */}
                  <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">E-Com</h1>
                  <p className="text-gray-600 mb-6">Perfect ecommerce platform to start your business from scratch</p>
                  <div className="flex space-x-5">
                      <FacebookIcon />
                      <TwitterIcon />
                      <LinkedInIcon />
                      <InstagramIcon />
                      <YouTubeIcon/>
            </div>
        </div>
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-4">My Account</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Track Orders</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Washing</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">My Account</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Order History</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Latest News</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Talk To Us */}
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-4">Talk To Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Phone className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p>Old Question™ Call id:</p>
                  <p className="text-gray-900">+670 413 90 762</p>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <a href="mailto:support@example.com" className="hover:text-white transition-colors">
                  support@example.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p>by Siding-Hooker, SC</p>
                  <p>Janisaka, New York 1432</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p>© 2025 All Rights Reserved | Breedberry Private Ltd</p>
        </div>
    </footer>
  );
};

export default Footer;