/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Model N
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.modeln.batam.connector.wrapper;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * {
 * 		"id" : "Report Identifier",
 * 		"build_id" : "build identifier this test belong to",
 * 		"build_name" : "build name this test belong to",
 * 		"name" : "Report name",
 * 		"description" : "Report description",
 * 		"start_date" : "12341234", // Time in millisecond
 * 		"end_date" : "12341234", // Time in millisecond
 * 		"status" : "completed|failed|error| name it",
 * 		"logs" : ["list of html link to archived log files"]
 * }
 * 
 * @author gzussa
 *
 */
public class TestReport {
	private String id;
	
	private String buildId; 
	
	private String buildName;
	
	private String name; 
	
	private String description;
	
	private Date startDate;
	
	private Date endDate;
	
	private String status;
	
	private List<String> logs;

	public TestReport() {
		super();
	}
	
	public TestReport(String id, String name, String buildId, String buildName, 
			String description, Date startDate, Date endDate, String status,
			List<String> logs) {
		super();
		this.id = id;
		this.name = name;
		this.buildId = buildId;
		this.buildName = buildName;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.logs = logs;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBuildId() {
		return buildId;
	}

	public void setBuildId(String buildId) {
		this.buildId = buildId;
	}
	
	public String getBuildName() {
		return buildName;
	}

	public void setBuildName(String buildName) {
		this.buildName = buildName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public List<String> getLogs() {
		return logs;
	}

	public void setLogs(List<String> logs) {
		this.logs = logs;
	}
	
	public String toJSONString(){
		JSONObject obj = new JSONObject();
		obj.put("id", id);
		obj.put("name", name);
		obj.put("build_id", buildId);
		obj.put("build_name", buildName);
		obj.put("description", description);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("status", status);
		obj.put("logs", logs);
		return obj.toJSONString();
	}
	
	@Override
	public String toString() {
		return toJSONString();
	}
	
	public static TestReport fromJSON(JSONObject obj){
		String id = (String)obj.get("id");
		String name = (String)obj.get("name");
		String buildId = (String)obj.get("build_id");
		String buildName = (String)obj.get("build_name");
		String description = (String)obj.get("description");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		String status = (String)obj.get("status");
		
		List<String> logs = new ArrayList<String>();
		JSONArray logsArray = (JSONArray)obj.get("logs");
		if(logsArray != null){
			for(Iterator<String> it = logsArray.iterator();it.hasNext();){
				String log = (String)it.next();
				logs.add(log);
			}
		}
		
		return new TestReport(id, name, buildId, buildName, description, startDate == null ? null : new Date(Long.valueOf(startDate)), endDate == null ? null : new Date(Long.valueOf(endDate)), status, logs);
	}
}
