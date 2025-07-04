/*
Copyright (C) 2017  Paul Marks  http://www.pmarks.net/

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";

// Requires <script src="common.js">

window.onload = async () => {
  await spriteImgReady;

  for (const option of Object.keys(DEFAULT_OPTIONS)) {
    if (!option.endsWith("ColorScheme")) continue;
    for (const color of ["darkfg", "lightfg"]) {
      const canvas = document.getElementById(`${option}:${color}`);
      const ctx = canvas.getContext("2d");
      const imageData = buildIcon("646", 16, color);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const ipv4pages = document.getElementById("ipv4pages");
  for (const domain of IPV4_ONLY_DOMAINS.keys()) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `https://${domain}`;
    a.target = "_blank";
    a.textContent = domain;
    li.appendChild(a);
    ipv4pages.appendChild(li);
  }

  watchOptions(function(optionsChanged) {
    for (const option of optionsChanged) {
      if (DEFAULT_OPTIONS.hasOwnProperty(option)) {
        const radio = document.optionsForm[option];
        radio.value = options[option];
      } else if (option == NAT64_KEY) {
        const table = document.getElementById("nat64");
        removeChildren(table);
        for (const packed96 of Array.from(options[NAT64_KEY]).sort()) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.appendChild(document.createTextNode(formatIPv6(packed96) + "/96"));
          tr.appendChild(td);
          table.appendChild(tr);
        }
      }
    }
  });

  document.optionsForm.onchange = function(evt) {
    const newOptions = {};
    for (const option of Object.keys(DEFAULT_OPTIONS)) {
      newOptions[option] = document.optionsForm[option].value;
    }
    setOptions(newOptions);
  };

  document.getElementById("revert_btn").onclick = function() {
    revertNAT64();
    setOptions(DEFAULT_OPTIONS);
  };

  document.getElementById("dismiss_btn").onclick = function() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1946972
  if (typeof browser != "undefined") {
    document.body.addEventListener("click", function(e) {
      if (e.target.tagName == "A" && (e.ctrlKey || e.metaKey || e.shiftKey)) {
        window.open(e.target.href);
        e.preventDefault();
      }
    });
    document.body.addEventListener("auxclick", function(e) {
      if (e.target.tagName == "A" && e.button == 1) {
        window.open(e.target.href);
        e.preventDefault();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // IP Lookup Provider
  const ipLookupSelect = document.getElementById("ipLookupProvider");
  if (ipLookupSelect && typeof ipProviderUrls === "object") {
    ipLookupSelect.innerHTML = "";
    for (const [key, url] of Object.entries(ipProviderUrls)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      ipLookupSelect.appendChild(option);
    }
  }

  // DNS Lookup Provider
  const dnsLookupSelect = document.getElementById("dnsLookupProvider");
  if (dnsLookupSelect && typeof dnsProviderUrls === "object") {
    dnsLookupSelect.innerHTML = "";
    for (const [key, url] of Object.entries(dnsProviderUrls)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      dnsLookupSelect.appendChild(option);
    }
  }
});
